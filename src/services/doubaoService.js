export const generateDoubaoImage = async (apiKey, submitUrl, resultUrl, imageBase64, prompt) => {
  try {
    // 1. 提交任务
    const submitResponse = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageBase64, // 假设接口接收 Base64 格式图片，不带前缀
        prompt: prompt,
        model: "doubao-seededit-v30" // 显式指定模型，虽然URL里有了
      })
    });

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json();
      throw new Error(errorData.message || '提交任务失败');
    }

    const submitData = await submitResponse.json();
    
    // 假设返回结构中有 task_id，具体字段可能需要调试，这里假设是 data.task_id 或 output.task_id
    // 根据 302.ai 常见结构，可能是 { id: "..." } 或 { data: { id: "..." } }
    const taskId = submitData.id || submitData.data?.id || submitData.task_id;

    if (!taskId) {
      throw new Error('未获取到任务ID');
    }

    // 2. 轮询结果
    let attempts = 0;
    const maxAttempts = 30; // 30次 * 2秒 = 60秒超时
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
      
      // 这里的 resultUrl 可能是 GET 或 POST，通常 302.ai 查询结果可能是 GET /task/{id} 或 POST {task_id}
      // 根据用户提供的 URL 格式 ..._result，更像是 POST 查询
      const checkResponse = await fetch(resultUrl, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task_id: taskId
        })
      });
      
      if (!checkResponse.ok) {
        // 如果查询失败，可能是暂时的，继续尝试
        console.warn('查询状态失败，重试中...');
        attempts++;
        continue;
      }

      const checkData = await checkResponse.json();
      
      // 检查状态
      // 假设状态字段是 status，成功是 'SUCCEEDED' 或 'SUCCESS'
      const status = checkData.status || checkData.data?.status;
      
      if (status === 'SUCCEEDED' || status === 'SUCCESS') {
        // 获取结果图片
        const imageUrl = checkData.output?.image_url || checkData.data?.image_url || checkData.image_url;
        if (imageUrl) {
          return imageUrl;
        }
      } else if (status === 'FAILED') {
        throw new Error(checkData.error || '任务执行失败');
      }
      
      attempts++;
    }
    
    throw new Error('生成超时，请稍后重试');

  } catch (error) {
    console.error('Doubao API Error:', error);
    throw error;
  }
};
