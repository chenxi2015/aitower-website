---
title: 常见问题与排障
description: 关于本地 Vault 安全性、文件格式兼容性与更新分发的常见解答。
section: guides
order: 1
---

## 使用 aitower 会修改我原有的 Obsidian 文件吗？

不会在后台暗箱篡改。aitower 采用本地优先设计，直接读写你的 Vault 目录，只有在你主动编辑保存、插入导出图片或新建文件时才会写入磁盘。所有删除操作均进入系统回收站。

## 原有的 .canvas 和 .excalidraw 文件能直接打开吗？

可以。笔记工作台与创作台原生兼容 Obsidian 的 `.md`、`[[Wikilink]]`、`.canvas` 以及 `.excalidraw` 文件。

## 如何获取最新版本或核验安装包安全性？

所有桌面客户端安装包均由 GitHub Actions 自动构建并托管于公开仓库 [chenxi2015/aitower-releases](https://github.com/chenxi2015/aitower-releases/releases)，每个版本均附带校验文件。已安装的客户端也可通过内置自更新机制直接升级。

## 为什么推荐「半手搓」而不是全自动生成？

因为真正能打动读者的长文与架构图，核心价值在于作者的真实思考与逻辑取舍。AI 擅长资料检索、初稿发散与画板布局起草，而最后的判断、删减与视觉定稿交给你自己，才能避免千篇一律的「AI 味」。
