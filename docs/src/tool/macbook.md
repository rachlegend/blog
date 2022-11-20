---
title: Macbook Tricks
date: 2020-12-15
tags:
 - MacBook
categories: 
 - Tools
sidebar: 'auto'
---
# 取消终端系统更新提示红点

:::  warning

🚧 重新启动后，红点依旧会出现

:::

1. **Step 1**

   ```shell
   defaults write com.apple.systempreferences AttentionPrefBundleIDs 0
   ```
2. **Step 2**

   ```shell
   Killall Dock
   ```
