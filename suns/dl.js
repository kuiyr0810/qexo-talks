// 创建一个简化的元素生成函数
function createElement(tag, classNames = [], textContent = '') {
    const element = document.createElement(tag);
    if (classNames.length) element.className = classNames.join(' ');
    if (textContent) element.textContent = textContent;
    return element;
}

function createDengContainer() {
    const container = createElement('div', ['deng-container']);
    
    // 创建左右两个包裹盒
    const leftSide = createElement('div', ['deng-side-box']);
    const rightSide = createElement('div', ['deng-side-box']);

    const scriptSrc = document.currentScript.src;
    const urlParams = new URLSearchParams(scriptSrc.split('?')[1]);
    const customText = urlParams.get('text');
    const texts = customText ? customText.split('') : ['新', '年', '快', '乐'];

    texts.forEach((text, index) => {
        const box = createElement('div', ['deng-box']); // 去掉了具体的 deng-box1/2/3
        // ... 这里保持你原来的内部 DOM 构建逻辑 (deng, xian, dengA, dengB 等) ...
        
        // 关键逻辑：前两个放左边，后两个放右边
        if (index < 2) {
            leftSide.appendChild(box);
        } else {
            rightSide.appendChild(box);
        }
    });

    container.appendChild(leftSide);
    container.appendChild(rightSide);
    document.body.appendChild(container);
}

function addStyles() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = `
        /* 1. 顶部容器：横跨全屏，不干扰鼠标点击 */
        .deng-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 9999;
            pointer-events: none;
            display: flex;
            justify-content: space-between; /* 关键：左右分布 */
            padding: 0 50px; /* 两端留出间距 */
        }

        /* 2. 左右分区：将灯笼成对排列 */
        .deng-side-box {
            display: flex;
            gap: 20px; /* 灯笼之间的间距 */
        }

        /* 3. 灯笼盒子：移除原来的 fixed 定位，改为相对定位 */
        .deng-box {
            position: relative;
            pointer-events: auto; /* 让灯笼本身可以响应鼠标（如果需要） */
        }

        /* --- 以下完全保留你原有的精美绘图样式，仅微调了阴影和位置 --- */
        .deng {
            position: relative;
            width: 120px;
            height: 90px;
            background: rgba(216, 0, 15, .8);
            border-radius: 50% 50%;
            animation: swing 3s infinite ease-in-out;
            box-shadow: -5px 5px 50px 4px #fa6c00;
            transform-origin: top center; /* 挂在顶端摇摆 */
        }
        .deng-a { width: 100px; height: 90px; background: rgba(216, 0, 15, .1); border-radius: 50%; border: 2px solid #dc8f03; margin-left: 7px; display: flex; justify-content: center; }
        .deng-b { width: 65px; height: 83px; background: rgba(216, 0, 15, .1); border-radius: 60%; border: 2px solid #dc8f03; }
        .xian { position: absolute; top: -20px; left: 60px; width: 2px; height: 20px; background: #dc8f03; }
        .shui-a { position: relative; width: 5px; height: 20px; margin: -5px 0 0 59px; animation: swing 4s infinite ease-in-out; transform-origin: 50% -45px; background: orange; border-radius: 0 0 5px 5px; }
        .shui-b { position: absolute; top: 14px; left: -2px; width: 10px; height: 10px; background: #dc8f03; border-radius: 50%; }
        .shui-c { position: absolute; top: 18px; left: -2px; width: 10px; height: 35px; background: orange; border-radius: 0 0 0 5px; }
        .deng:before, .deng:after { content: " "; display: block; position: absolute; border-radius: 5px; border: solid 1px #dc8f03; background: linear-gradient(to right, #dc8f03, orange, #dc8f03, orange, #dc8f03); }
        .deng:before { top: -7px; left: 29px; height: 12px; width: 60px; z-index: 999; }
        .deng:after { bottom: -7px; left: 10px; height: 12px; width: 60px; margin-left: 20px; }
        .deng-t { font-family: '华文行楷', Arial, sans-serif; font-size: 3.2rem; color: #dc8f03; font-weight: 700; line-height: 85px; text-align: center; }

        /* 移动端适配 */
        @media (max-width: 768px) {
            .deng-container { padding: 0 10px; }
            .deng-box { transform: scale(0.5); transform-origin: top center; margin-top: -20px; }
            .deng-side-box { gap: 0; }
        }

        @keyframes swing {
            0% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
            100% { transform: rotate(-10deg); }
        }
    `;
    document.head.appendChild(style);
}

// 引入时调用
function init() {
    addStyles();
    createDengContainer();
}

// 调用初始化函数
init();
