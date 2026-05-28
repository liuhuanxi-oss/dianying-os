#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - 输出格式化工具
支持JSON和表格两种输出模式
"""
import json
import click
from typing import Any, Dict, List, Optional


class OutputFormatter:
    """输出格式化器"""
    
    def __init__(self, json_output: bool = False):
        self.json_output = json_output
    
    def format(self, data: Any, pretty: bool = True) -> str:
        """
        格式化输出
        
        Args:
            data: 待格式化的数据
            pretty: 是否美化输出
            
        Returns:
            格式化后的字符串
        """
        if self.json_output:
            return self.format_json(data, pretty)
        else:
            return self.format_table(data)
    
    def format_json(self, data: Any, pretty: bool = True) -> str:
        """
        JSON格式化
        
        Args:
            data: 待格式化的数据
            pretty: 是否美化输出
            
        Returns:
            JSON字符串
        """
        if pretty:
            return json.dumps(data, ensure_ascii=False, indent=2)
        else:
            return json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    
    def format_table(self, data: Any) -> str:
        """
        表格格式化
        
        Args:
            data: 待格式化的数据
            
        Returns:
            表格字符串
        """
        if isinstance(data, dict):
            return self._format_dict(data)
        elif isinstance(data, list):
            return self._format_list(data)
        else:
            return str(data)
    
    def _format_dict(self, data: Dict) -> str:
        """格式化字典"""
        lines = []
        for key, value in data.items():
            # 格式化key
            formatted_key = self._format_key(key)
            # 格式化value
            if isinstance(value, dict):
                lines.append(f"{formatted_key}:")
                for k, v in value.items():
                    lines.append(f"  {self._format_key(k)}: {self._format_value(v)}")
            elif isinstance(value, list) and value and isinstance(value[0], dict):
                lines.append(f"{formatted_key}:")
                for item in value:
                    for k, v in item.items():
                        lines.append(f"  {self._format_key(k)}: {self._format_value(v)}")
                    lines.append("")
            else:
                lines.append(f"{formatted_key}: {self._format_value(value)}")
        return '\n'.join(lines)
    
    def _format_list(self, data: List) -> str:
        """格式化列表"""
        lines = []
        for i, item in enumerate(data, 1):
            if isinstance(item, dict):
                lines.append(f"[{i}]")
                for key, value in item.items():
                    lines.append(f"  {self._format_key(key)}: {self._format_value(value)}")
            else:
                lines.append(f"[{i}] {item}")
            lines.append("")
        return '\n'.join(lines).strip()
    
    def _format_key(self, key: str) -> str:
        """格式化键名"""
        # 驼峰转下划线
        result = []
        for i, char in enumerate(key):
            if char.isupper() and i > 0:
                result.append('_')
            result.append(char.lower())
        return ''.join(result)
    
    def _format_value(self, value: Any) -> str:
        """格式化值"""
        if value is None:
            return "-"
        elif isinstance(value, bool):
            return "是" if value else "否"
        elif isinstance(value, (int, float)):
            return str(value)
        elif isinstance(value, str):
            # 截断长字符串
            if len(value) > 100:
                return value[:100] + "..."
            return value
        else:
            return str(value)
    
    def print(self, data: Any, pretty: bool = True):
        """打印输出"""
        output = self.format(data, pretty)
        click.echo(output)
    
    def print_success(self, message: str, data: Any = None):
        """打印成功信息"""
        if self.json_output:
            result = {"success": True, "message": message}
            if data:
                result["data"] = data
            click.echo(self.format_json(result))
        else:
            click.echo(click.style("✓ ", fg='green') + message)
            if data:
                self.print(data)
    
    def print_error(self, message: str, data: Any = None):
        """打印错误信息"""
        if self.json_output:
            result = {"success": False, "error": message}
            if data:
                result["data"] = data
            click.echo(self.format_json(result))
        else:
            click.echo(click.style("✗ ", fg='red') + message, err=True)
            if data:
                self.print(data)
    
    def print_warning(self, message: str):
        """打印警告信息"""
        if self.json_output:
            click.echo(self.format_json({"warning": message}))
        else:
            click.echo(click.style("⚠ ", fg='yellow') + message)


def format_response(response: Dict, json_output: bool = False, verbose: bool = False) -> str:
    """
    格式化API响应
    
    Args:
        response: API响应数据
        json_output: 是否JSON输出
        verbose: 是否显示详细信息
        
    Returns:
        格式化后的字符串
    """
    formatter = OutputFormatter(json_output=json_output)
    
    if json_output:
        return formatter.format_json(response)
    
    # 非JSON输出
    lines = []
    
    # 基础信息
    code = response.get('code', response.get('bizCode', 'N/A'))
    msg = response.get('msg', response.get('bizMsg', ''))
    
    if code == '0000':
        status_icon = click.style("✓", fg='green')
        status_text = "成功"
    else:
        status_icon = click.style("✗", fg='red')
        status_text = "失败"
    
    lines.append(f"{status_icon} [{code}] {status_text} - {msg}")
    lines.append("")
    
    # 响应数据
    resp_data = response.get('respData', {})
    if resp_data:
        lines.append("响应数据:")
        lines.append(formatter.format(resp_data))
    
    # 详细信息
    if verbose:
        lines.append("")
        lines.append("原始响应:")
        lines.append(formatter.format_json(response, pretty=True))
    
    return '\n'.join(lines)


def create_formatter(json_output: bool = False) -> OutputFormatter:
    """创建格式化器"""
    return OutputFormatter(json_output=json_output)
