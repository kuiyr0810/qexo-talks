(function() {
    const authorInfo = {
        name: "Sunshine.",
        blog: "https://kuiyr.de",
        version: "v1.0.0",
        github: "https://github.com/kuiyr0810"
    };

    const style1 = "background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff; font-weight: bold;";
    const style2 = "background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff; font-weight: bold;";
    const style3 = "color: #41b883; font-style: italic; text-decoration: underline;";

    console.log(
        `%c Snow %c ${authorInfo.version} `, 
        style1, style2, 
        `特效已加载。作者: ${authorInfo.name}`
    );
    console.log(`%c项目主页: %c${authorInfo.blog}`, "color: #666;", style3);
    
    
    function createElement(tag, classNames = [], textContent = '') {
        const element = document.createElement(tag);
        if (classNames.length) element.className = classNames.join(' ');
        if (textContent) element.textContent = textContent;
        return element;
    }

    // CSS 样式
    function addStyles() {
        if (document.getElementById('deng-style')) return;
        const style = document.createElement('style');
        style.id = 'deng-style';
        style.type = 'text/css';
        style.textContent = `
            .deng-container {
                position: fixed; top: 0; left: 0; width: 100%; z-index: 9999;
                pointer-events: none; display: flex; justify-content: space-between;
                padding: 0 40px; box-sizing: border-box;
            }
            .deng-side-box { display: flex; gap: 15px; }
            .deng-box { position: relative; width: 120px; }
            .deng {
                position: relative; width: 120px; height: 90px; margin: 50px 0;
                background: rgba(216, 0, 15, .8); border-radius: 50% 50%;
                animation: swing 3s infinite ease-in-out; transform-origin: top center;
                box-shadow: -5px 5px 50px 4px #fa6c00;
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
            .deng-t { font-family: '华文行楷', 'STXingkai', 'Microsoft YaHei', sans-serif; font-size: 3.2rem; color: #dc8f03; font-weight: 700; line-height: 85px; text-align: center; }
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

    // 初始化灯笼
    function init() {
        addStyles();
        const container = createElement('div', ['deng-container']);
        const leftSide = createElement('div', ['deng-side-box']);
        const rightSide = createElement('div', ['deng-side-box']);

        // 获取当前 script 标签上的 text 参数
        const scripts = document.getElementsByTagName('script');
        const currentScript = scripts[scripts.length - 1];
        const urlParams = new URLSearchParams(currentScript.src.split('?')[1]);
        const customText = urlParams.get('text') || '新年快乐';
        const texts = customText.split('');

        texts.forEach((text, index) => {
            const box = createElement('div', ['deng-box']);
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

            // 动态分配：文字的一半在左，一半在右
            if (index < Math.ceil(texts.length / 2)) {
                leftSide.appendChild(box);
            } else {
                rightSide.appendChild(box);
            }
        });

        container.appendChild(leftSide);
        container.appendChild(rightSide);
        document.body.appendChild(container);
    }

    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
