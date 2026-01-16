# DDL Transformer 浏览器插件

一个简单的Chrome/Edge浏览器插件，用于将SQL DDL语句转换为表格格式。

## 功能

将剪贴板中的SQL DDL语句转换为以下格式：
- 第一行：表名
- 之后每行：`字段名\t字段类型\t字段注释`（用Tab分隔）

### 输入示例
```sql
CREATE TABLE IF NOT EXISTS dwd_mc_member_info_d
(
      account_id                                      BIGINT                  COMMENT '会员账号'
    , dist_id                                         STRING                  COMMENT 'cn卡号'
)
COMMENT 'DWD-MC-用户基础信息日表'
PARTITIONED BY (ds STRING COMMENT '分区')
;
```

### 输出示例
```
dwd_mc_member_info_d
account_id	BIGINT	会员账号
dist_id	STRING	cn卡号
```

## 安装方法

### Chrome 浏览器

1. 打开 Chrome 浏览器，在地址栏输入 `chrome://extensions/`
2. 开启右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择本插件所在的文件夹（`DDLTransformer`）
5. 插件安装完成，工具栏会出现插件图标

### Edge 浏览器

1. 打开 Edge 浏览器，在地址栏输入 `edge://extensions/`
2. 开启左侧的「开发人员模式」
3. 点击「加载解压缩的扩展」
4. 选择本插件所在的文件夹（`DDLTransformer`）
5. 插件安装完成

## 使用方法

1. 复制你的SQL DDL语句到剪贴板（Ctrl+C / Cmd+C）
2. 点击浏览器工具栏中的插件图标
3. 点击「📋 读取剪贴板并转换」按钮
4. 转换结果会自动复制到剪贴板
5. 直接粘贴（Ctrl+V / Cmd+V）到你需要的地方即可

## 支持的DDL格式

- `CREATE TABLE table_name (...)`
- `CREATE TABLE IF NOT EXISTS table_name (...)`
- 支持带反引号的表名和字段名
- 支持 `COMMENT '注释'` 格式的字段注释

## 文件结构

```
DDLTransformer/
├── manifest.json     # 插件配置文件
├── popup.html        # 插件弹窗界面
├── popup.js          # DDL解析核心逻辑
├── icons/            # 图标文件夹
│   ├── generate_icons.html  # 图标生成工具
│   └── *.svg         # SVG图标文件
└── README.md         # 使用说明
```

## 生成PNG图标（可选）

如果需要为插件添加图标：

1. 用浏览器打开 `icons/generate_icons.html`
2. 点击下载按钮保存三个尺寸的PNG图标
3. 修改 `manifest.json` 添加图标配置

## 许可证

MIT License
