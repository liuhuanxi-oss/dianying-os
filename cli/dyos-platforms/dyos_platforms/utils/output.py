"""
输出格式化工具

支持JSON和表格两种输出模式
"""

import json
from typing import Any, Dict, List, Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.syntax import Syntax


class OutputFormatter:
    """输出格式化器"""
    
    def __init__(self, json_output: bool = False):
        self.json_output = json_output
        self.console = Console()
    
    def success(self, message: str):
        """输出成功消息"""
        if self.json_output:
            self.output({"status": "success", "message": message})
        else:
            self.console.print(f"[green]✓[/green] {message}")
    
    def error(self, message: str):
        """输出错误消息"""
        if self.json_output:
            self.output({"status": "error", "message": message})
        else:
            self.console.print(f"[red]✗[/red] {message}")
    
    def info(self, message: str):
        """输出信息消息"""
        if self.json_output:
            self.output({"status": "info", "message": message})
        else:
            self.console.print(f"[blue]ℹ[/blue] {message}")
    
    def output(self, data: Any):
        """输出数据（JSON格式）"""
        if isinstance(data, (dict, list)):
            json_str = json.dumps(data, ensure_ascii=False, indent=2)
            syntax = Syntax(json_str, "json", theme="monokai", line_numbers=False)
            self.console.print(syntax)
        else:
            self.console.print(data)
    
    def print_table(
        self,
        data: List[Dict],
        title: str = None,
        columns: List[str] = None,
        show_header: bool = True
    ):
        """打印表格"""
        if not data:
            self.info("暂无数据")
            return
        
        table = Table(title=title, show_header=show_header, box=True)
        
        # 自动检测列
        if columns is None:
            # 取第一个数据的所有键作为列
            columns = list(data[0].keys()) if data else []
        
        # 添加列
        for col in columns:
            # 格式化列名
            display_name = col.replace("_", " ").title()
            table.add_column(display_name, style="cyan")
        
        # 添加行
        for item in data:
            row = []
            for col in columns:
                value = item.get(col, "")
                # 格式化值
                if isinstance(value, (int, float)):
                    row.append(str(value))
                elif isinstance(value, dict):
                    row.append(json.dumps(value, ensure_ascii=False))
                elif value is None:
                    row.append("-")
                else:
                    row.append(str(value))
            table.add_row(*row)
        
        self.console.print(table)
    
    def print_list(self, items: List[str], title: str = None):
        """打印列表"""
        if self.json_output:
            self.output(items)
        else:
            if title:
                self.console.print(f"\n[bold]{title}[/bold]")
            for i, item in enumerate(items, 1):
                self.console.print(f"  {i}. {item}")
    
    def print_panel(self, content: str, title: str = None, style: str = "blue"):
        """打印面板"""
        panel = Panel(content, title=title, border_style=style)
        self.console.print(panel)
    
    def print_dict(self, data: Dict, title: str = None):
        """打印字典为键值对"""
        if self.json_output:
            self.output(data)
        else:
            if title:
                self.console.print(f"\n[bold]{title}[/bold]")
            for key, value in data.items():
                display_key = key.replace("_", " ").title()
                if isinstance(value, dict):
                    self.console.print(f"  [cyan]{display_key}:[/cyan]")
                    for k, v in value.items():
                        self.console.print(f"    {k}: {v}")
                elif isinstance(value, list):
                    self.console.print(f"  [cyan]{display_key}:[/cyan] ({len(value)} items)")
                else:
                    self.console.print(f"  [cyan]{display_key}:[/cyan] {value}")


def format_json(data: Any, indent: int = 2) -> str:
    """格式化JSON字符串"""
    return json.dumps(data, ensure_ascii=False, indent=indent)


def parse_json(json_str: str) -> Any:
    """解析JSON字符串"""
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return None
