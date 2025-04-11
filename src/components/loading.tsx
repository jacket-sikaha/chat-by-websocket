import styles from '../pages/home/test2.module.css'; // css module 导入

function Loading() {
  return (
    <div>
      <h1>
        <a href="#">test style</a>
      </h1>
      <h3>我是子组件的h3，css module使用了标签选择器定义的样式还是会影响全局</h3>
      <div className={styles.test}>css module导入使用父组件样式</div>
    </div>
  );
}

export default Loading;
