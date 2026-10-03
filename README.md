# 匠力王产品交互展示样板

静态网站：17 个产品资料条目、5 类筛选、3 款三维外观模型。
模型支持旋转、缩放、四面查看、自动旋转和复位；其他产品提供海报资料。
包装、尺寸和说明依据现有图片近似整理，正式资料待企业核对。

## 在线浏览

https://lzlin3459-hash.github.io/jolywon-3d-catalog/

访客无需安装 Node.js 或 Python。图片、模型和 Three.js 从本站同源加载。
手机需要支持 WebGL 的现代浏览器，模型加载失败时可查看包装原图。

## 宣传样片

- [36 秒横版](./outputs/jolywon-catalog-sample-landscape.mp4)
- [36 秒竖版](./outputs/jolywon-catalog-sample-portrait.mp4)

## 本地预览

在此目录执行 `python -m http.server 8000`，访问 http://127.0.0.1:8000 。
请通过 HTTP 打开页面，以加载 JavaScript 模块和 GLB。

Three.js 的授权说明见 vendor/three/LICENSE。
GitHub Pages 部署采用 main 分支根目录；国内移动网络直连可用性需实测。
