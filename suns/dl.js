// 1. 创建元素的辅助函数
function createElement(tag, classNames = [], textContent = '') {
    const element = document.createElement(tag);
    if (classNames.length) element.className = classNames.join(' ');
    if (textContent) element.textContent = textContent;
    return element;

// 2. 添加 CSS 样式（保留原有绘图细节，优化容器布局）
function addStyles() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = `
        /* 容器：全宽固定在顶部 */
        .deng-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 9999;
            pointer-events: none;
            display: flex;
            justify-content: space-between;
            padding: 0 40px;
            box-sizing: border-box;
        
        /* 分组容器 */
        .deng-side-box {
            display: flex;
            gap: 10px;
        
        .deng-box {
            position: relative;
            width: 120px;
        
        /* --- 保留原有的灯笼精美绘图逻辑 --- */
        .deng {
            position: relative;
            width: 120px;
            height: 90px;
            background: rgba(216, 0, 15, .8);
            border-radius: 50% 50%;
            animation: swing 3s infinite ease-in-out;
            box-shadow: -5px 5px 50px 4px #fa6c00;
            transform-origin: top center;
        
        .deng-a { 
            width: 100px; height: 90px; background: rgba(216, 0, 15, .1); 
            border-radius: 50%; border: 2px solid #dc8f03; 
            margin-left: 7px; display: flex; justify-content: center; 
        
        .deng-b { 
            width: 65px; height: 83px; background: rgba(216, 0, 15, .1); 
            border-radius: 60%; border: 2px solid #dc8f03; 
        
        .xian { 
            position: absolute; top: -20px; left: 60px; 
            width: 2px; height: 20px; background: #dc8f03; 
        
        .shui-a { 
            position: relative; width: 5px; height: 20px; 
            margin: -5px 0 0 59px; animation: swing 4s infinite ease-in-out; 
            transform-origin: 50% -45px; background: orange; border-radius: 0 0 5px 5px; 
        
        .shui-b { position: absolute; top: 14px; left: -2px; width: 10px; height: 10px; background: #dc8f03; border-radius: 50%; }
        .shui-c { position: absolute; top: 18px; left: -2px; width: 10px; height: 35px; background: orange; border-radius: 0 0 0 5px
        .deng:before, .deng:after { 
            content: " "; display: block; position: absolute; border-radius: 5px; 
            border: solid 1px #dc8f03; background: linear-gradient(to right, #dc8f03, orange, #dc8f03, orange, #dc8f03); 
        }
        .deng:before { top: -7px; left: 29px; height: 12px; width: 60px; z-index: 999; }
        .deng:after { bottom: -7px; left: 10px; height: 12px; width: 60px; margin-left: 20px; 
        .deng-t { 
            font-family: '华文行楷', 'STXingkai', 'Microsoft YaHei', sans-serif; 
            font-size: 3.2rem; color: #dc8f03; font-weight: 700; 
            line-height: 85px; text-align: center; 
        
        /* 响应式调整 */
        @media (max-width: 768px) {
            .deng-container { padding: 0 10px; }
            .deng-box { transform: scale(0.6); transform-origin: top center; margin-top: -10px; }
        
        @keyframes swing {
            0% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
            100% { transform: rotate(-10deg); }
        }
    `;
    document.head.appendChild(style);

// 3. 构建灯笼 DOM
function createDengContainer() {
    const container = createElement('div', ['deng-container']);
    
    // 布局：分为左右两组
    const leftSide = createElement('div', ['deng-side-box']);
    const rightSide = createElement('div', ['deng-side-box'])
    // 文本处理（由于是静态页面演示，默认使用'新年快乐'）
    const texts = ['新', '年', '快', '乐']
    texts.forEach((text, index) => {
        const box = createElement('div', ['deng-box']);
        const deng = createElement('div', ['deng']);
        const xian = createElement('div', ['xian']);
        const dengA = createElement('div', ['deng-a']);
        const dengB = createElement('div', ['deng-b']);
        const dengT = createElement('div', ['deng-t'], text)
        dengB.appendChild(dengT);
        dengA.appendChild(dengB);
        deng.appendChild(xian);
        deng.appendChild(dengA)
        const shuiA = createElement('div', ['shui', 'shui-a']);
        const shuiC = createElement('div', ['shui-c']);
        const shuiB = createElement('div', ['shui-b'])
        shuiA.appendChild(shuiC);
        shuiA.appendChild(shuiB);
        deng.appendChild(shuiA);
        box.appendChild(deng)
        // 逻辑：前两个挂左边，后两个挂右边
        if (index < 2) {
            leftSide.appendChild(box);
        } else {
            rightSide.appendChild(box);
        }
    })
    container.appendChild(leftSide);
    container.appendChild(rightSide);
    document.body.appendChild(container);

// 4. 初始化
function init() {
    addStyles();
    createDengContainer();

init();
