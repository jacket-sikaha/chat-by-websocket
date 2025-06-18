import request from '@/utils/request';
import { AttachmentsProps } from '@ant-design/x';
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

export const uploadFileReq = (
  file: Parameters<NonNullable<AttachmentsProps['customRequest']>>[0]['file'],
  userId: string,
  controller?: AbortController,
  onProgress?: (loaded: number, percent: number, file: any) => void
) => {
  // 创建 FormData
  const formData = new FormData();
  formData.append('file', file); // 字段名与后端一致
  formData.append('userId', userId);
  return request.post('/api/share-file/upload', formData, {
    timeout: 300 * 1000,
    signal: controller?.signal,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onProgress?.(progressEvent.loaded, percent, file);
      }
    }
  });
};
export const customUploadFileReq = (
  options: Parameters<NonNullable<AttachmentsProps['customRequest']>>[0],
  userId: string
) => {
  const { file, onProgress, onSuccess, onError } = options;
  // 创建取消令牌（用于中断上传）
  const controller = new AbortController();

  let lastLoaded = 0;
  let lastTime = Date.now();

  // 发送上传请求
  // let response = await request.post('/api1/share-file/upload', formData, {
  //   timeout: 300 * 1000,
  //   signal: controller?.signal,
  //   onUploadProgress: (progressEvent) => {
  //     if (progressEvent.total) {
  //       const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
  //       console.warn('file-----------------:', file);
  //       onProgress?.({ percent }, file);

  //       const currentTime = Date.now();
  //       const timeDiff = currentTime - lastTime;
  //       const dataDiff = progressEvent.loaded - lastLoaded;
  //       const rate = (dataDiff / timeDiff) * 1000; // 字节/秒
  //       // console.log(`速率：${(rate / 1024).toFixed(2)} KB/s`);
  //       // console.log(`速率：${formatSpeed(rate ?? 0)}  `);
  //       // 更新记录值
  //       lastLoaded = progressEvent.loaded;
  //       lastTime = currentTime;
  //     }
  //     // console.log('.rate', formatBandwidth(progressEvent.rate ?? 0));
  //   }
  // });

  uploadFileReq(file, userId, controller, (loaded, percent, _file) => {
    onProgress?.({ percent }, _file);
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTime;
    const dataDiff = loaded - lastLoaded;
    const rate = (dataDiff / timeDiff) * 1000; // 字节/秒
    rate;
    // console.log(`速率：${(rate / 1024).toFixed(2)} KB/s`);
    // console.log(`速率：${formatSpeed(rate ?? 0)}  `);
    // 更新记录值
    lastLoaded = loaded;
    lastTime = currentTime;
  })
    .then((res) => {
      if (res?.data?.id) {
        (file as any).fid = res.data.id;
      }
      // 手动触发成功状态（适配 antd 的 Upload 组件）
      onSuccess?.(res, res.request);
    })
    .catch((error) => {
      // 错误处理
      if (axios.isCancel(error)) {
        onError?.(new Error('用户取消上传'));
      } else {
        onError?.(new Error(error.code));
      }
    });

  return controller;
};
