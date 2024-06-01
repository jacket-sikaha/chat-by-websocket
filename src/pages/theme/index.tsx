import { Suspense, lazy, useState } from 'react';
import styles from './css/style.module.css';
// css module对文件名和导入方式都有要求，需要这么写 import xxx from "./xxxx.module.css";
import { JSX } from 'react/jsx-runtime';
import img1 from './img/team-1.jpg';
import img2 from './img/team-2.jpg';
import img3 from './img/team-3.jpg';
import img4 from './img/team-4.jpg';

// Suspense是用于包裹延迟加载组件的，独立于延迟加载组件外，但却对其产生作用
// 就像这里Suspense是对Test作用，而不是作用于外部lazy定义的Theme组件
// Suspense处理lazy组件遵循就近原则，这里Suspense优先对Test作用
// 如果注释这里的Suspense，将有该组件外的Suspense负责处理（至少要有一个不然报错），如果是放在最外层的Suspense且只有他一个，内部有多少个lazy组件就处理多少次
const Test = lazy(() =>
  delayForDemo(Promise.resolve({ default: () => <h2>测试延迟加载组件嵌套使用</h2> }))
);

const themes = ['light', 'dark', 'cupcake', 'retro', 'valentine'];
function ThemePage() {
  const [theme, setTheme] = useState('light');

  return (
    <>
      <div>theme</div>
      <Suspense fallback={<h3 className="text-blue-600">loading111</h3>}>
        <div className="flex">
          {themes.map((item) => {
            return (
              <button key={item} onClick={() => setTheme(item)}>
                {item}
              </button>
            );
          })}
        </div>
        <div data-theme={theme} className="overflow-auto bg-th-bg text-th-text">
          <Test />
          <section>
            <div className={styles['testimonial-container']}>
              <div className="row h-full">
                <div className="col-md-12">
                  <div className="main-title wow fadeIn" data-wow-delay="300ms">
                    <br />
                    <h1 className="text-center"> NICE TESTIMONIALS </h1>
                  </div>
                </div>
              </div>
              <br />
              <div className="row m-0">
                <div className="col-sm-12 h-[700px]">
                  <div className={styles['owl-carousel']}>
                    <div className={styles['testimonial-item']}>
                      <div className={styles['testimonial-box']}>
                        <div className={styles['testimonial-text']}>
                          <p>
                            Donec semper euismod nisi quis feugiat. Nullam finibus metus eget orci
                            volutpat porta. Morbi quis arcu vulputate, dignissim mi ac, varius
                            magna. porta. dignissim mi ac, varius magna.
                          </p>
                          <span className={styles['testimonial-date']}>December 20, 2018</span>
                          <span className={styles['testimonial-arrow']}></span>
                        </div>
                      </div>
                      <div className={styles['testimonial-photo']}>
                        <img alt="" src={img1} />
                      </div>
                      <h5 className="text-capitalize color-black mb-1 mt-3">Robin T Philips</h5>
                      <p className="color-pink">Businessman</p>
                    </div>
                    <div className={styles['testimonial-item']}>
                      <div className={styles['testimonial-text']}>
                        <p>
                          Donec semper euismod nisi quis feugiat. Nullam finibus metus eget orci
                          volutpat porta. Morbi quis arcu vulputate, dignissim mi ac, varius magna.
                          porta. dignissim mi ac, varius magna.{' '}
                        </p>
                        <span className={styles['testimonial-date']}>October 13, 2018</span>
                        <span className={styles['testimonial-arrow']}></span>
                      </div>
                      <div className={styles['testimonial-photo']}>
                        <img alt="" src={img2} />
                      </div>
                      <h5 className="text-capitalize color-black mb-1 mt-3">Jessica Oliver</h5>
                      <p className="color-pink">Model</p>
                    </div>
                    <div className={styles['testimonial-item']}>
                      <div className={styles['testimonial-text']}>
                        <p>
                          Donec semper euismod nisi quis feugiat. Nullam finibus metus eget orci
                          volutpat porta. Morbi quis arcu vulputate, dignissim mi ac, varius magna.
                          porta. dignissim mi ac, varius magna.{' '}
                        </p>
                        <span className={styles['testimonial-date']}>April 23, 2018</span>
                        <span className={styles['testimonial-arrow']}></span>
                      </div>
                      <div className={styles['testimonial-photo']}>
                        <img alt="" src={img3} />
                      </div>
                      <h5 className="text-capitalize color-black mb-1 mt-3">Teena Williamson</h5>
                      <p className="color-pink">SEO Specialist</p>
                    </div>
                    <div className={styles['testimonial-item']}>
                      <div className={styles['testimonial-text']}>
                        <p>
                          Donec semper euismod nisi quis feugiat. Nullam finibus metus eget orci
                          volutpat porta. Morbi quis arcu vulputate, dignissim mi ac, varius magna.
                          porta. dignissim mi ac, varius magna.
                        </p>
                        <span className={styles['testimonial-date']}>June 04, 2018</span>
                        <span className={styles['testimonial-arrow']}></span>
                      </div>
                      <div className={styles['testimonial-photo']}>
                        <img alt="" src={img4} />
                      </div>
                      <h5 className="text-capitalize color-black mb-1 mt-3">Micheal Anderson</h5>
                      <p className="color-pink">The New Company</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Suspense>
    </>
  );
}

export default ThemePage;

// 添加一个固定的延迟时间，以便你可以看到加载状态
function delayForDemo(promise: Promise<{ default: () => JSX.Element }>) {
  console.log('开始加载第二个lazy组件');
  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  }).then(() => {
    console.log('第二个lazy组件load finished');
    return promise;
  });
}
