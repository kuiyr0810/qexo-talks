// 创建一个简化的元素生成函数
function createElement(tag, classNames = [], textContent = '') {
    const element = document.createElement(tag);
    if (classNames.length) element.className = classNames.join(' ');
    if (textContent) element.textContent = textContent;
    return element;
}

// 创建并添加元素
function createDengContainer() {
    const container = createElement('div', ['deng-container']);

    // 从当前脚本的 URL 获取参数
    const scriptSrc = document.currentScript.src;
    const urlParams = new URLSearchParams(scriptSrc.split('?')[1]);
    const customText = urlParams.get('text');
    const texts = customText ? customText.split('') : ['新', '年', '快', '乐'];

    texts.forEach((text, index) => {
        const box = createElement('div', ['deng-box', `deng-box${index + 1}`]);

        const deng = createElement('div', ['deng']);
        const xian = createElement('div', ['xian']);
        const dengA = createElement('div', ['deng-a']);
        const dengB = createElement('div', ['deng-b']);
        const dengT = createElement('div', ['deng-t'], text);

        dengB.appendChild(dengT);
        dengA.appendChild(dengB);
        deng.appendChild(xian);
        deng.appendChild(dengA);

        const shuiA = createElement('div', ['shui', 'shui-a']);
        const shuiC = createElement('div', ['shui-c']);
        const shuiB = createElement('div', ['shui-b']);

        shuiA.appendChild(shuiC);
        shuiA.appendChild(shuiB);
        deng.appendChild(shuiA);
        box.appendChild(deng);
        container.appendChild(box);
    });

    document.body.appendChild(container);
}

function addStyles() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = `
        /* 容器改为全宽，方便控制两端的灯笼 */
        .deng-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 0;
            z-index: 9999;
            pointer-events: none;
            display: flex;
            justify-content: space-between; /* 让灯笼分布在两端 */
            padding: 0 20px;
        }

        /* 统一灯笼盒子的基础样式 */
        .deng-box {
            position: relative;
            display: inline-block;
            margin: 0 10px;
        }

        /* 针对电脑端：前两个灯笼靠左，后两个靠右 */
        /* 通过调整顺序或容器，这里我们直接微调具体位置 */
        .deng-box1 { order: 1; top: 10px; }
        .deng-box2 { order: 2; top: 5px; }
        .deng-box3 { order: 4; top: 10px; } /* 放在最右 */
        .deng-box4 { order: 3; top: 5px; }

        .deng {
            position: relative;
            width: 120px;
            height: 90px;
            background: #d8000f;
            background: rgba(216, 0, 15, .8);
            border-radius: 50% 50%;
            animation: swing 3s infinite ease-in-out;
            box-shadow: -5px 5px 50px 4px #fa6c00;
            transform-origin: top center; /* 修正摇摆中心点 */
        }
        
        /* ... 其他保持不变，但建议统一修改 .deng-t 的行高 ... */
        .deng-t {
            font-family: '华文行楷', 'Microsoft YaHei', sans-serif;
            font-size: 2.8rem;
            color: #dc8f03;
            font-weight: 700;
            line-height: 90px; /* 垂直居中 */
            text-align: center;
        }

        /* 移动端适配：缩小并调整间距 */
        @media (max-width: 768px) {
            .deng-container { padding: 0 5px; }
            .deng-box { transform: scale(0.4); margin: -20px; }
            .deng-box1 { order: 1; }
            .deng-box2 { order: 2; }
            .deng-box3 { order: 3; }
            .deng-box4 { order: 4; }
        }

        @keyframes swing {
            0% { transform: rotate(-6deg); }
            50% { transform: rotate(6deg); }
            100% { transform: rotate(-6deg); }
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
