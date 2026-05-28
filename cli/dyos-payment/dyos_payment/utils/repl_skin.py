#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - REPL交互皮肤
提供交互式命令行界面
"""
import sys
import cmd
import click
from typing import Optional, Dict, Any, Callable

from .output import OutputFormatter


class REPLSkin(cmd.Cmd):
    """REPL交互皮肤"""
    
    intro = """
╔══════════════════════════════════════════════════════════════╗
║          店赢OS天阙支付CLI工具 v1.0.0                         ║
║          DYOS Payment CLI for Tianque Pay                     ║
╚══════════════════════════════════════════════════════════════╝

欢迎使用店赢OS天阙支付CLI工具！
输入 'help' 查看可用命令，输入 'quit' 或 'exit' 退出。
    """
    
    prompt = click.style("dyos-payment> ", fg='cyan', bold=True)
    doc_header = click.style("可用命令 (输入 'help 命令名' 查看详细用法):", fg='green')
    
    # 颜色定义
    colors = {
        'header': 'cyan',
        'success': 'green',
        'error': 'red',
        'warning': 'yellow',
        'info': 'blue',
        'dim': 'white',
    }
    
    def __init__(
        self,
        completekey: str = 'tab',
        stdin: Optional[Any] = None,
        stdout: Optional[Any] = None,
        json_output: bool = False,
        client: Optional[Any] = None
    ):
        """
        初始化REPL皮肤
        
        Args:
            completekey: 补全键
            stdin: 标准输入
            stdout: 标准输出
            json_output: 是否JSON输出
            client: API客户端实例
        """
        super().__init__(completekey, stdin, stdout)
        self.json_output = json_output
        self.formatter = OutputFormatter(json_output=json_output)
        self.client = client
        self.last_result: Optional[Dict] = None
    
    def preloop(self):
        """进入循环前的准备"""
        pass
    
    def postloop(self):
        """退出循环后的清理"""
        click.echo(click.style("\n再见！", fg='cyan'))
    
    def emptyline(self):
        """空行处理"""
        pass
    
    def default(self, line: str):
        """未知命令处理"""
        click.echo(click.style(f"未知命令: {line}", fg='red'))
        click.echo("输入 'help' 查看可用命令")
    
    def do_help(self, arg: str):
        """显示帮助"""
        if arg:
            self._show_command_help(arg)
        else:
            self._show_general_help()
    
    def _show_general_help(self):
        """显示总体帮助"""
        help_text = """
{title}
╔══════════════════════════════════════════════════════════════╗
║  商户管理                                                    ║
╠══════════════════════════════════════════════════════════════╣
║  merchant apply    - 商户入驻申请                             ║
║  merchant query    - 商户入驻结果查询                         ║
║  merchant modify   - 商户信息修改                             ║
║  merchant upload   - 图片上传                                 ║
╠══════════════════════════════════════════════════════════════╣
║  支付交易                                                    ║
╠══════════════════════════════════════════════════════════════╣
║  trade create     - 创建支付订单                             ║
║  trade query      - 支付结果查询                             ║
║  trade refund     - 申请退款                                 ║
║  trade close      - 关闭订单                                 ║
╠══════════════════════════════════════════════════════════════╣
║  分账                                                        ║
╠══════════════════════════════════════════════════════════════╣
║  split apply      - 分账申请                                 ║
║  split query      - 分账结果查询                             ║
╠══════════════════════════════════════════════════════════════╣
║  结算                                                        ║
╠══════════════════════════════════════════════════════════════╣
║  settle query     - 结算查询                                 ║
╠══════════════════════════════════════════════════════════════╣
║  对账                                                        ║
╠══════════════════════════════════════════════════════════════╣
║  reconcile download - 下载对账文件                            ║
╠══════════════════════════════════════════════════════════════╣
║  工具                                                        ║
╠══════════════════════════════════════════════════════════════╣
║  sign-test        - 测试签名                                 ║
║  config show      - 显示配置                                ║
║  env              - 切换环境                                 ║
╚══════════════════════════════════════════════════════════════╝
        """
        click.echo(click.style(help_text, fg='cyan'))
    
    def _show_command_help(self, command: str):
        """显示命令帮助"""
        help_map = {
            'merchant': """
{title}商户管理命令

用法:
  merchant apply <参数>
  merchant query <商户号>
  merchant modify <商户号>
  merchant upload <文件路径>

示例:
  merchant apply --name "测试商户" --mobile 13800138000
  merchant query --mno YOUR_MERCHANT_NO
  merchant upload --file ./license.jpg --type license
            """,
            'trade': """
{title}支付交易命令

用法:
  trade create <参数>
  trade query <订单号>
  trade refund <订单号>
  trade close <订单号>

示例:
  trade create --amount 100 --subject "测试订单"
  trade query --trade-no T123456
  trade refund --trade-no T123456 --amount 50
            """,
            'split': """
{title}分账命令

用法:
  split apply <参数>
  split query <分账单号>

示例:
  split apply --trade-no T123456 --ratio 0.7,0.3
  split query --split-no S123456
            """,
            'settle': """
{title}结算命令

用法:
  settle query <商户号> <日期>

示例:
  settle query --merchant-id M123456 --date 2026-04
            """,
            'reconcile': """
{title}对账命令

用法:
  reconcile download <日期>

示例:
  reconcile download --date 2026-04-30
            """,
        }
        
        cmd_lower = command.lower().split()[0] if command else ''
        if cmd_lower in help_map:
            click.echo(click.style(help_map[cmd_lower], fg='cyan'))
        else:
            click.echo(click.style(f"没有 '{command}' 命令的详细帮助", fg='yellow'))
    
    def do_merchant(self, arg: str):
        """商户管理命令"""
        self._execute_subcommand('merchant', arg)
    
    def do_trade(self, arg: str):
        """支付交易命令"""
        self._execute_subcommand('trade', arg)
    
    def do_split(self, arg: str):
        """分账命令"""
        self._execute_subcommand('split', arg)
    
    def do_settle(self, arg: str):
        """结算命令"""
        self._execute_subcommand('settle', arg)
    
    def do_reconcile(self, arg: str):
        """对账命令"""
        self._execute_subcommand('reconcile', arg)
    
    def do_sign_test(self, arg: str):
        """测试签名"""
        from ..crypto import RSACrypto
        from ..config import get_config
        
        config = get_config()
        crypto = RSACrypto(
            private_key_pem=config.private_key,
            algorithm=config.sign_algorithm
        )
        
        test_data = "orgId=YOUR_ORG_ID&reqId=test123&timestamp=1234567890"
        
        try:
            signature = crypto.sign(test_data)
            click.echo(click.style("✓ 签名测试成功", fg='green'))
            click.echo(f"签名数据: {test_data}")
            click.echo(f"签名结果: {signature}")
        except Exception as e:
            click.echo(click.style(f"✗ 签名测试失败: {e}", fg='red'))
    
    def do_config(self, arg: str):
        """显示配置"""
        from ..config import get_config
        
        config = get_config()
        
        if self.json_output:
            click.echo(self.formatter.format_json({
                "org_id": config.org_id,
                "env": config.env,
                "base_url": config.base_url,
                "test_merchant_no": config.test_merchant_no,
                "sign_algorithm": config.sign_algorithm,
                "timeout": config.timeout,
                "retry_times": config.retry_times,
            }))
        else:
            click.echo(click.style("当前配置:", fg='cyan'))
            click.echo(f"  org_id: {config.org_id}")
            click.echo(f"  env: {config.env}")
            click.echo(f"  base_url: {config.base_url}")
            click.echo(f"  test_merchant_no: {config.test_merchant_no}")
            click.echo(f"  sign_algorithm: {config.sign_algorithm}")
    
    def do_env(self, arg: str):
        """切换环境"""
        from ..config import switch_env
        
        env = arg.strip().lower() if arg else ''
        if env not in ('test', 'prod'):
            click.echo(click.style("用法: env <test|prod>", fg='yellow'))
            return
        
        switch_env(env)
    
    def do_quit(self, arg: str):
        """退出"""
        return True
    
    def do_exit(self, arg: str):
        """退出"""
        return True
    
    def do_EOF(self, arg: str):
        """Ctrl+D 退出"""
        print()
        return True
    
    def _execute_subcommand(self, module: str, arg: str):
        """执行子命令"""
        click.echo(click.style(f"[{module}] 请使用CLI命令模式执行详细操作", fg='yellow'))
        click.echo(f"示例: dyos-payment {module} --help")


class InteractiveShell:
    """交互式Shell"""
    
    def __init__(self, json_output: bool = False, client: Optional[Any] = None):
        self.json_output = json_output
        self.client = client
        self.repl = REPLSkin(json_output=json_output, client=client)
    
    def run(self):
        """运行交互式Shell"""
        self.repl.cmdloop()


def start_repl(json_output: bool = False, client: Optional[Any] = None):
    """启动REPL"""
    shell = InteractiveShell(json_output=json_output, client=client)
    shell.run()
