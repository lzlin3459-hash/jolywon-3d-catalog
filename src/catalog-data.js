// Names from the existing poster ledger; final model/version mapping awaits the manufacturer.
export const products = [
  { id: 'P01', name: '碳基高分子瓷砖胶', category: '瓷砖胶', poster: '1740c9fdb293876294da307fd1889b57.jpg' },
  { id: 'P02', name: '碳基填缝剂（黑袋）', category: '填缝剂', poster: '17695f4ee02cc3ce1760d0e423fcecb0.jpg' },
  { id: 'P03', name: '碳基刚性防水', category: '防水涂料', poster: '3e77fc79ed61d9ab9ca6a9d31f85f64c.jpg' },
  { id: 'P04', name: '碳基超耐候拉毛背胶', category: '拉毛背胶', poster: '420cbbcf7e036de4e59985425c1aed8a.jpg', group: 3, sources: ['3.jpg', '3侧.jpg', '3背.jpg', '3接缝.jpg'], model: '../outputs/weather-primer.glb', lidColor: '#c66b0b', weight: '18 kg', purpose: '拉毛处理', description: '包装正面标注“滚涂拉毛”。查看产品外观，或打开背标了解包装列明的使用资料。', facts: ['滚涂拉毛', '两组分包装标识'], factSources: ['正面包装特点栏', '正面英文 Two-Component 标识'] },
  { id: 'P05', name: '碳基橡胶防水', category: '防水涂料', poster: '4fe167ada7fb7c2dde8b9dbc56b96028.jpg' },
  { id: 'P06', name: '碳基瓷砖胶 C0', category: '瓷砖胶', poster: '551bf3e5c1cfa907b4f139e94bd6e186.jpg' },
  { id: 'P07', name: '碳基瓷砖胶 C1', category: '瓷砖胶', poster: '68a9d1010854a7d871dbd45e5ffccd22.jpg' },
  { id: 'P08', name: '碳基 3D 防水涂料（蓝桶）', category: '防水涂料', poster: '77178c65f512ce8b8439defde67f6ecc.jpg' },
  { id: 'P09', name: '碳基瓷砖胶 C1T', category: '瓷砖胶', poster: '97a56a37735372cbd8c6783eda2c3aa4.jpg' },
  { id: 'P10', name: '碳基瓷砖胶 C2', category: '瓷砖胶', poster: '9f206f77987d9dc91b5939f5075e0863.jpg' },
  { id: 'P11', name: '碳基高分子界面剂', category: '基层处理', poster: 'a221b74a9a39c9762764d0b8c880d93e.jpg' },
  { id: 'P12', name: '碳基柔性防水', category: '防水涂料', poster: 'b39722bb7f193bee6b9cef2e3e9da649.jpg', group: 2, sources: ['2.jpg', '2侧.jpg', '2背.jpg', '2接縫.jpg'], model: '../outputs/flexible-waterproof.glb', lidColor: '#086c58', weight: '18 kg', purpose: '防水与防潮', description: '正面包装标注“地面专用”，背标列明卫生间、厨房、阳台等部位的防水、防潮用途。具体适用条件以正式说明为准。', facts: ['地面专用', '防水、防潮用途'], factSources: ['正面包装用途标识', '背标产品特点栏'] },
  { id: 'P13', name: '碳基固沙宝', category: '基层处理', poster: 'b9a56b9e8017edd37e9850bca7617569.jpg' },
  { id: 'P14', name: '碳基复合拉毛背胶', category: '拉毛背胶', poster: 'be25286f70af3908ef695da403604c99.jpg', group: 1, sources: ['1.jpg', '1侧.jpg', '1背.jpg', '1接缝.jpg'], model: '../outputs/composite-primer.glb', lidColor: '#075b35', weight: '16 kg', purpose: '界面拉毛处理', description: '依据包装说明，展示通过滚涂形成毛糙界面的用途。具体适用条件和施工要求请查阅正式产品说明。', facts: ['水性配方', '滚涂拉毛'], factSources: ['背标产品特点栏', '背标产品特点及施工方法栏'] },
  { id: 'P15', name: '碳基 3D 防水涂料（红桶）', category: '防水涂料', poster: 'cf6bbf2d8d62004e5ebb0decd5324798.jpg' },
  { id: 'P16', name: '碳基瓷砖胶 C2T', category: '瓷砖胶', poster: 'dbbd386707da47c7e486eb9cb47d6f72.jpg' },
  { id: 'P17', name: '碳基填缝剂（绿袋）', category: '填缝剂', poster: 'f3a581a3103aa41870d0cb49cf4e993a.jpg' },
];
export const featuredIds = ['P14', 'P12', 'P04'];
export const categories = ['全部产品', '拉毛背胶', '防水涂料', '瓷砖胶', '基层处理', '填缝剂'];
export function detailUrl(id) { return `./product.html?id=${encodeURIComponent(id)}`; }
export function sourceUrl(file) { return `./效果图/${file}`; }
