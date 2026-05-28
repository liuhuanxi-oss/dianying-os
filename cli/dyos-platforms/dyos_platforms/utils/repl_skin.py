"""
REPL交互皮肤

提供交互式命令行的美化输出
"""

from rich.console import Console
from rich.theme import Theme

# 自定义主题
custom_theme = Theme({
    "info": "cyan",
    "warning": "yellow",
    "error": "red bold",
    "success": "green",
    "platform": "magenta bold",
    "command": "blue bold",
    "prompt": "green",
})


class REPLSkin:
    """REPL交互皮肤"""
    
    def __init__(self):
        self.console = Console(theme=custom_theme)
    
    def get_banner(self) -> str:
        """获取启动Banner"""
        return """
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ██╗    ██╗███████╗██████╗ ███████╗██╗     ██╗███╗   ██╗███████╗██████╗    ║
║     ██║    ██║██╔════╝██╔══██╗██╔════╝██║     ██║████╗  ██║██╔════╝██╔══██╗   ║
║     ██║ █╗ ██║█████╗  ██████╔╝█████╗  ██║     ██║██╔██╗ ██║█████╗  ██████╔╝   ║
║     ██║███╗██║██╔══╝  ██╔══██╗██╔══╝  ██║     ██║██║╚██╗██║██╔══╝  ██╔══██╗   ║
║     ╚███╔███╔╝███████╗██████╔╝███████╗███████╗██║██║ ╚████║███████╗██║  ██║   ║
║      ╚══╝╚══╝ ╚══════╝╚═════╝ ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝   ║
║                                                              ║
║         OS - 8大本地生活平台统一管理CLI                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""
    
    def get_prompt(self, platform: str = None) -> str:
        """获取命令提示符"""
        if platform:
            return f"[prompt]dyos:{platform}$[/prompt] "
        return "[prompt]dyos>[/prompt] "
    
    def get_help_text(self) -> str:
        """获取帮助文本"""
        return """
╭──────────────────────────────────────────────────────────────╮
│  命令帮助                                                     │
├──────────────────────────────────────────────────────────────┤
│  平台命令:                                                    │
│    meituan     - 美团/大众点评                                │
│    eleme       - 饿了么                                       │
│    douyin      - 抖音本地生活                                 │
│    xiaohongshu - 小红书                                       │
│    wechat      - 微信视频号                                   │
│    amap        - 高德地图                                     │
│    alipay      - 支付宝/口碑                                  │
│    baidu       - 百度地图                                     │
│    all         - 跨平台聚合                                   │
│    list        - 列出所有平台                                  │
├──────────────────────────────────────────────────────────────┤
│  通用命令:                                                    │
│    help        - 显示帮助                                      │
│    exit/quit   - 退出                                         │
├──────────────────────────────────────────────────────────────┤
│  示例:                                                        │
│    dyos> meituan shop list                                   │
│    dyos> all review list --days 7                            │
│    dyos> amap poi search --keyword 火锅 --city 上海           │
╰──────────────────────────────────────────────────────────────╯
"""
    
    def print_platforms(self, platforms: list):
        """打印平台列表"""
        self.console.print("\n[bold]支持的平台:[/bold]\n")
        
        from rich.columns import Columns
        from rich.panel import Panel
        
        panels = []
        for p in platforms:
            platform_info = f"""
[cyan]命令:[/cyan] {p['command']}
[cyan]名称:[/cyan] {p['name']}
[cyan]状态:[/cyan] {'[green]已配置[/green]' if p.get('configured') else '[yellow]Mock模式[/yellow]'}
"""
            panels.append(Panel(platform_info.strip(), title=p['name'], border_style="blue"))
        
        self.console.print(Columns(panels))
    
    def print_welcome(self):
        """打印欢迎信息"""
        self.console.print(self.get_banner())
        self.console.print(self.get_help_text())
