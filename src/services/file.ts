import request from '@/utils/request';
import axios from 'axios';

export const downloadFileReq = (userId: string, fid: string): Promise<Blob> => {
  return request.post(
    `/api/share-file/download-stream`,
    { userId, fid },
    {
      timeout: 300 * 1000,
      responseType: 'blob'
    }
  );
};

export const customUploadFileReq = async (options: any, userId: string) => {
  let response;
  const { file, onProgress, onSuccess, onError } = options;
  // 创建 FormData
  const formData = new FormData();
  formData.append('file', file); // 字段名与后端一致
  formData.append('userId', userId);
  // 创建取消令牌（用于中断上传）
  const source = axios.CancelToken.source();

  try {
    // 发送上传请求
    response = await request.post('/api/share-file/upload', formData, {
      timeout: 300 * 1000,
      cancelToken: source.token,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress({ percent }, file);
        }
      }
    });

    if (response?.data?.id) {
      file.fid = response.data.id;
    }
    // 手动触发成功状态（适配 antd 的 Upload 组件）
    onSuccess(response, file);
  } catch (error) {
    // 错误处理
    if (axios.isCancel(error)) {
      onError(new Error('用户取消上传'), file);
    } else {
      onError(response);
    }
  }

  // 返回中止方法
  return {
    abort() {
      source.cancel('用户取消上传');
    }
  };
};
