## Qexo说说页面优化

使用方法：
在talks/index.md中写入代码
```
<head>
  <!-- ... -->
  <link rel="stylesheet" href="https://fastly.jsdelivr.net/gh/kuiyr0810/qexo-talks@main/suns/talk.css">
  <script src="//fastly.jsdelivr.net/gh/kuiyr0810/qt@main/suns/talk.js"></script>
  <!-- ... -->
</head>
<body>
  <!-- ... -->
  <div id="my-shouts-container"></div>
  <script>
    myQexoShouts.init({
        el: "#my-shouts-container", 
        avatar: "https://img.kuiyr.de/file/1753932255231_image.png", // 你的头像
        name: "Sunshine.", // 你的名字
        limit: 10, // 加载几条
        baseURL: "https://admin.example.com" // 你的Qexo API地址
    }).catch(function(error) {
        console.error("加载过程中出现问题:", error);
    });
    </script>
</body>
```
上传使用即可
