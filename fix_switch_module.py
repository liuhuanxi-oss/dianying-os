#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复店赢OS侧边栏switchModule函数
将 event.currentTarget/event.target 改为通过函数参数传递
"""

import re
import os

def fix_merchant_html():
    """修复merchant.html"""
    filepath = "dianying-os/merchant.html"
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # 1. 修复switchModule函数：添加el参数，用el替代event.currentTarget
    old_func = '''function switchModule(moduleName) {
            // 更新侧边栏
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            event.currentTarget.classList.add('active');'''
    
    new_func = '''function switchModule(moduleName, el) {
            // 更新侧边栏 - 修复：使用传入的el参数替代event.currentTarget
            const navItem = el || event.currentTarget;
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            navItem.classList.add('active');'''
    
    content = content.replace(old_func, new_func)
    
    # 2. 批量替换onclick调用：switchModule('xxx') -> switchModule('xxx', this)
    # 匹配 onclick="switchModule('模块名')"
    pattern = r'onclick="switchModule\(\'([^\']+)\'\)"'
    
    def replace_onclick(match):
        module_name = match.group(1)
        return f'onclick="switchModule(\'{module_name}\', this)"'
    
    content = re.sub(pattern, replace_onclick, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ merchant.html 修复完成")
    return filepath

def fix_platform_html():
    """修复platform.html"""
    filepath = "dianying-os/platform.html"
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # 1. 修复switchModule函数
    old_func = '''function switchModule(module) {
            document.querySelectorAll('.module-content[id^="module-"]').forEach(el => {
                if (el.id !== 'module-' + module) el.classList.remove('active');
            });
            const target = document.getElementById('module-' + module);
            if (target) target.classList.add('active');
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            event.target.closest('.nav-item').classList.add('active');
        }'''
    
    new_func = '''function switchModule(module, el) {
            // 修复：使用传入的el参数替代event.target
            const navItem = el || event.target.closest('.nav-item');
            document.querySelectorAll('.module-content[id^="module-"]').forEach(item => {
                if (item.id !== 'module-' + module) item.classList.remove('active');
            });
            const target = document.getElementById('module-' + module);
            if (target) target.classList.add('active');
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            navItem.classList.add('active');
        }'''
    
    content = content.replace(old_func, new_func)
    
    # 2. 批量替换onclick调用
    pattern = r'onclick="switchModule\(\'([^\']+)\'\)"'
    
    def replace_onclick(match):
        module_name = match.group(1)
        return f'onclick="switchModule(\'{module_name}\', this)"'
    
    content = re.sub(pattern, replace_onclick, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ platform.html 修复完成")
    return filepath

def fix_agent_html():
    """修复agent.html"""
    filepath = "agent.html"
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # 1. 修复switchModule函数
    old_func = '''function switchModule(module) {
            // 隐藏所有模块
            document.querySelectorAll('.module-content').forEach(el => el.classList.remove('active'));
            // 显示目标模块
            document.getElementById('module-' + module).classList.add('active');
            
            // 更新侧边栏状态
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            event.target.closest('.nav-item').classList.add('active');
        }'''
    
    new_func = '''function switchModule(module, el) {
            // 修复：使用传入的el参数替代event.target
            const navItem = el || event.target.closest('.nav-item');
            // 隐藏所有模块
            document.querySelectorAll('.module-content').forEach(item => item.classList.remove('active'));
            // 显示目标模块
            const targetModule = document.getElementById('module-' + module);
            if (targetModule) targetModule.classList.add('active');
            
            // 更新侧边栏状态
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            navItem.classList.add('active');
        }'''
    
    content = content.replace(old_func, new_func)
    
    # 2. 批量替换onclick调用
    pattern = r'onclick="switchModule\(\'([^\']+)\'\)"'
    
    def replace_onclick(match):
        module_name = match.group(1)
        return f'onclick="switchModule(\'{module_name}\', this)"'
    
    content = re.sub(pattern, replace_onclick, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ agent.html 修复完成")
    return filepath

if __name__ == "__main__":
    print("=" * 50)
    print("开始修复switchModule函数...")
    print("=" * 50)
    
    fix_merchant_html()
    fix_platform_html()
    fix_agent_html()
    
    print("=" * 50)
    print("✓ 所有文件修复完成!")
    print("=" * 50)
