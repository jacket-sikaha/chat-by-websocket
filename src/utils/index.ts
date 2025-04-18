/**
 * 触发文件下载
 * @param Uint8Array File 数据
 * @param type 完整的文件类型（必须包含后缀，如 "file.pdf"）
 */
export function downloadBlob(
  file: Blob,
  type = 'application/octet-stream',
  filename?: string
): void {
  // 文件名有明确扩展名 可不设置 type
  // 文件名无扩展名 必须设置 type
  // 需要浏览器直接解析内容 必须设置 type
  const blob = new Blob([file], { type });
  // 创建一个隐藏的 <a> 元素
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);

  // 生成 Object URL
  const url = URL.createObjectURL(blob);

  // 设置下载属性（使用传入的完整文件名）
  link.href = url;
  link.download = filename ?? Date.now().toString();

  // 模拟点击触发下载
  link.click();

  // 清理生成的 Object URL（延迟确保下载触发）
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
}
