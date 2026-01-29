import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { getUserProfile } from '../services/userActivityService';
import { optimizePromptWithProfile } from '../services/userProfileService';
import { trackActivity } from '../services/userActivityService';

/**
 * 提示词优化组件
 * @param {string} value - 当前提示词内容
 * @param {function} onOptimized - 优化完成后的回调函数，接收优化后的提示词
 * @param {string} featureKey - 功能键名，用于获取配置
 * @param {string} buttonClassName - 按钮的额外样式类
 * @param {string} featureContext - 功能上下文信息，帮助AI更好地优化提示词
 */
const PromptOptimizer = ({ value, onOptimized, featureKey = 'AI提示词专家', buttonClassName = '', featureContext = '' }) => {
  const config = useSystemConfig();
  const [isOptimizing, setIsOptimizing] = useState(false);

  // 获取提示词专家配置
  const promptExpertConfig = config.features['AI提示词专家'];

  const handleOptimize = async () => {
    if (!value || !value.trim()) {
      alert('请先输入需要优化的提示词');
      return;
    }

    if (!promptExpertConfig?.apiKey) {
      alert('提示词专家功能未配置，请联系管理员');
      return;
    }

    setIsOptimizing(true);

    try {
      // 获取用户画像
      const userProfile = getUserProfile();

      // 如果有用户画像，使用个性化优化
      if (userProfile && userProfile.industry && userProfile.industry !== '未识别') {
        const optimizedPrompt = await optimizePromptWithProfile(
          value,
          userProfile,
          featureKey,
          promptExpertConfig.apiKey,
          promptExpertConfig.apiUrl || '/api/302/chat/completions'
        );

        onOptimized(optimizedPrompt);

        // 记录提示词优化活动（个性化）
        trackActivity(featureKey, 'prompt_optimize_personalized', {
          hasProfile: true,
          industry: userProfile.industry,
          originalLength: value.length,
          optimizedLength: optimizedPrompt.length
        });
      } else {
        // 使用常规优化
        const systemPrompt = featureContext
          ? `你是一位专业的提示词优化专家。请优化用户的提示词，使其更加精确、详细和有效。上下文：${featureContext}。要求：1. 保持原意不变；2. 使提示词更加具体和明确；3. 添加必要的细节描述；4. 使用专业且简洁的语言；5. 直接输出优化后的提示词，不要有任何解释或前言。`
          : '你是一位专业的提示词优化专家。请优化用户的提示词，使其更加精确、详细和有效。要求：1. 保持原意不变；2. 使提示词更加具体和明确；3. 添加必要的细节描述；4. 使用专业且简洁的语言；5. 直接输出优化后的提示词，不要有任何解释或前言。';

        const response = await fetch(promptExpertConfig.apiUrl || '/api/302/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${promptExpertConfig.apiKey}`
          },
          body: JSON.stringify({
            model: promptExpertConfig.modelName || 'glm-4.7-flashx',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: `请优化以下提示词：\n\n${value}`
              }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const optimizedPrompt = data.choices?.[0]?.message?.content || value;

          // 移除可能的引号包裹
          const cleanPrompt = optimizedPrompt.replace(/^["']|["']$/g, '').trim();

          onOptimized(cleanPrompt);

          // 记录提示词优化活动（常规）
          trackActivity(featureKey, 'prompt_optimize_standard', {
            hasProfile: false,
            originalLength: value.length,
            optimizedLength: cleanPrompt.length
          });
        } else {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || '优化失败');
        }
      }
    } catch (error) {
      console.error('提示词优化错误:', error);
      alert(`优化失败: ${error.message}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <button
      onClick={handleOptimize}
      disabled={isOptimizing || !value?.trim()}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        isOptimizing || !value?.trim()
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg'
      } ${buttonClassName}`}
      title="使用AI优化提示词"
    >
      {isOptimizing ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          优化中...
        </>
      ) : (
        <>
          <Sparkles size={14} />
          优化提示词
        </>
      )}
    </button>
  );
};

export default PromptOptimizer;
