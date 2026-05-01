"""
店赢OS CLI - 输出格式化工具
"""
import json
from typing import Any, Dict, List, Optional
from rich.console import Console
from rich.table import Table
from rich.syntax import Syntax
from rich.panel import Panel

console = Console()


class Output:
    """输出格式化"""
    
    def __init__(self, use_json: bool = False):
        self.use_json = use_json
    
    def print(self, data: Any, message: str = ""):
        """打印输出"""
        if self.use_json:
            self._print_json(data, message)
        else:
            self._print_table(data, message)
    
    def _print_json(self, data: Any, message: str = ""):
        """JSON格式输出"""
        output = {"code": 0, "message": message, "data": data}
        syntax = Syntax(json.dumps(output, ensure_ascii=False, indent=2), "json", theme="monokai")
        console.print(syntax)
    
    def _print_table(self, data: Any, message: str = ""):
        """表格格式输出"""
        if message:
            console.print(f"[bold cyan]{message}[/bold cyan]")
        
        if isinstance(data, dict):
            if "items" in data:
                self._print_table_data(data["items"])
            elif "items" not in data and data:
                for key, value in data.items():
                    if isinstance(value, (list, dict)):
                        continue
                    console.print(f"  [cyan]{key}:[/cyan] {value}")
            else:
                console.print("[dim]无数据[/dim]")
        elif isinstance(data, list):
            self._print_table_data(data)
        else:
            console.print(data)
    
    def _print_table_data(self, items: List[Dict]):
        """打印表格数据"""
        if not items:
            console.print("[dim]无数据[/dim]")
            return
        
        if not isinstance(items, list) or not items:
            return
        
        # 获取所有字段
        if isinstance(items[0], dict):
            keys = list(items[0].keys())
            table = Table(show_header=True, header_style="bold magenta")
            
            for key in keys:
                # 格式化字段名
                header = key.replace("_", " ").title()
                table.add_column(header)
            
            for item in items:
                row = []
                for key in keys:
                    value = item.get(key, "")
                    if isinstance(value, float):
                        value = f"{value:,.2f}"
                    row.append(str(value))
                table.add_row(*row)
            
            console.print(table)
        else:
            for item in items:
                console.print(f"  • {item}")
    
    def print_success(self, message: str):
        """打印成功消息"""
        if self.use_json:
            console.print_json(json.dumps({"code": 0, "message": message}))
        else:
            console.print(f"[bold green]✓[/bold green] {message}")
    
    def print_error(self, message: str):
        """打印错误消息"""
        if self.use_json:
            console.print_json(json.dumps({"code": -1, "message": message}))
        else:
            console.print(f"[bold red]✗[/bold red] {message}")
    
    def print_warning(self, message: str):
        """打印警告消息"""
        if self.use_json:
            console.print_json(json.dumps({"code": -2, "message": message}))
        else:
            console.print(f"[bold yellow]![/bold yellow] {message}")
    
    def print_panel(self, content: str, title: str = ""):
        """打印面板"""
        panel = Panel(content, title=title, border_style="cyan")
        console.print(panel)
