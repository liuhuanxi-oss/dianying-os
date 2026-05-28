"""
店赢OS - 海报生成器
使用Pillow库生成餐饮/零售/休娱行业促销海报

使用方法:
    from generators import PosterGenerator
    
    gen = PosterGenerator()
    url = gen.generate(
        theme="520情人节",
        title="甜蜜告白季",
        subtitle="限时8折 · 全场优惠",
        style="romantic",
        store_name="老码头火锅"
    )
"""

import os
import time
import math
from PIL import Image, ImageDraw, ImageFont
from typing import Optional, Tuple

class PosterGenerator:
    """海报生成器"""
    
    # 预定义尺寸
    SIZES = {
        "poster": (1080, 1920),    # 手机海报
        "square": (1080, 1080),    # 朋友圈正方形
        "wide": (1920, 1080),      # 横版海报
    }
    
    # 风格配色
    STYLES = {
        "romantic": {
            "bg": (255, 182, 193),      # 粉色
            "accent": (255, 105, 180),   # 深粉
            "text": (139, 0, 0),         # 深红文字
            "pattern": "hearts",         # 心形图案
        },
        "festival": {
            "bg": (220, 20, 60),         # 中国红
            "accent": (255, 215, 0),     # 金色
            "text": (255, 255, 255),     # 白色文字
            "pattern": "fireworks",      # 烟花图案
        },
        "luxury": {
            "bg": (45, 45, 48),          # 深灰
            "accent": (218, 165, 32),    # 金色
            "text": (255, 255, 255),     # 白色文字
            "pattern": "geometric",     # 几何图案
        },
        "fresh": {
            "bg": (144, 238, 144),       # 浅绿
            "accent": (34, 139, 34),     # 深绿
            "text": (0, 100, 0),         # 绿色文字
            "pattern": "leaves",         # 叶子图案
        },
        "ocean": {
            "bg": (65, 105, 225),        # 皇家蓝
            "accent": (0, 191, 255),    # 天蓝
            "text": (255, 255, 255),     # 白色文字
            "pattern": "waves",          # 波浪图案
        },
    }
    
    def __init__(self, output_dir: str = "public/posters"):
        """
        初始化生成器
        
        Args:
            output_dir: 输出目录
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # 字体路径（尝试多个可能的路径）
        self.font_paths = [
            "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",  # 文泉驿
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            None  # 使用默认字体
        ]
        self._font_cache = {}
    
    def _get_font(self, size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
        """
        获取字体
        
        Args:
            size: 字体大小
            bold: 是否粗体
        """
        cache_key = (size, bold)
        if cache_key in self._font_cache:
            return self._font_cache[cache_key]
        
        for font_path in self.font_paths:
            try:
                if font_path and os.path.exists(font_path):
                    font = ImageFont.truetype(font_path, size)
                    self._font_cache[cache_key] = font
                    return font
            except:
                continue
        
        # 使用默认字体
        font = ImageFont.load_default()
        self._font_cache[cache_key] = font
        return font
    
    def generate(
        self,
        theme: str = "节日促销",
        title: str = "限时特惠",
        subtitle: str = "全场8折",
        style: str = "festival",
        store_name: str = "店赢OS",
        size_type: str = "poster",
        logo_text: Optional[str] = None
    ) -> str:
        """
        生成海报
        
        Args:
            theme: 主题（如"520情人节"、"中秋促销"）
            title: 主标题
            subtitle: 副标题/促销信息
            style: 风格（romantic/festival/luxury/fresh/ocean）
            store_name: 店铺名称
            size_type: 尺寸类型（poster/square/wide）
            logo_text: Logo文字（可选）
            
        Returns:
            海报文件路径（相对URL）
        """
        # 获取配色和尺寸
        style_config = self.STYLES.get(style, self.STYLES["festival"])
        width, height = self.SIZES.get(size_type, self.SIZES["poster"])
        
        # 创建画布
        img = Image.new('RGB', (width, height), style_config["bg"])
        draw = ImageDraw.Draw(img)
        
        # 绘制背景装饰
        self._draw_background_patterns(draw, width, height, style_config, size_type)
        
        # 绘制顶部装饰
        self._draw_top_decoration(draw, width, height, style_config)
        
        # 添加主题标签
        self._draw_theme_badge(draw, theme, width, style_config)
        
        # 添加主标题
        self._draw_title(draw, title, width, height, style_config)
        
        # 添加促销信息
        self._draw_subtitle(draw, subtitle, width, height, style_config)
        
        # 添加装饰线
        self._draw_divider(draw, width, height, style_config)
        
        # 添加店铺名称/Logo
        self._draw_logo(draw, store_name, logo_text, width, height, style_config)
        
        # 添加底部装饰
        self._draw_bottom_decoration(draw, width, height, style_config)
        
        # 保存文件
        filename = f"poster_{style}_{int(time.time())}.png"
        filepath = os.path.join(self.output_dir, filename)
        img.save(filepath, "PNG")
        
        return f"/posters/{filename}"
    
    def _draw_background_patterns(
        self, 
        draw: ImageDraw.Draw, 
        width: int, 
        height: int,
        style: dict,
        size_type: str
    ):
        """绘制背景图案"""
        pattern_type = style["pattern"]
        color = style["accent"]
        alpha_color = (*color[:3], 50)  # 半透明
        
        if pattern_type == "hearts":
            # 心形图案
            for i in range(15):
                x = (i * 200 + 50) % width
                y = (i * 300 + 100) % height
                size = 20 + (i % 5) * 5
                self._draw_heart(draw, x, y, size, alpha_color)
                
        elif pattern_type == "fireworks":
            # 烟花/光点图案
            import random
            random.seed(42)  # 固定种子保证可重现
            for _ in range(50):
                x = random.randint(0, width)
                y = random.randint(0, height)
                size = random.randint(3, 10)
                draw.ellipse([x-size, y-size, x+size, y+size], fill=(*color[:3], 100))
                
        elif pattern_type == "geometric":
            # 几何图案
            for i in range(8):
                y = i * (height // 8)
                draw.rectangle([0, y, width, y + 3], fill=(*color[:3], 30))
                
        elif pattern_type == "waves":
            # 波浪图案
            for i in range(5):
                y = height - 200 + i * 40
                for x in range(0, width, 100):
                    draw.arc([x, y, x+100, y+40], 0, 180, fill=(*color[:3], 40), width=2)
    
    def _draw_heart(self, draw: ImageDraw.Draw, x: int, y: int, size: int, color: tuple):
        """绘制心形"""
        # 简化心形用两个圆和三角形
        draw.ellipse([x-size//2, y-size, x+size//2, y-size//2], fill=color)
        draw.ellipse([x-size//2, y-size//2, x+size//2, y+size//2], fill=color)
    
    def _draw_top_decoration(self, draw: ImageDraw.Draw, width: int, height: int, style: dict):
        """绘制顶部装饰"""
        color = style["accent"]
        # 顶部渐变条
        for i in range(20):
            alpha = int(255 * (1 - i / 20))
            y = i * 2
            draw.rectangle([0, y, width, y + 2], fill=(*color[:3], alpha // 4))
    
    def _draw_theme_badge(self, draw: ImageDraw.Draw, theme: str, width: int, style: dict):
        """绘制主题标签"""
        font = self._get_font(36)
        color = style["text"]
        bg_color = style["accent"]
        
        # 标签背景
        text_bbox = draw.textbbox((0, 0), theme, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        badge_width = text_width + 60
        badge_height = text_height + 30
        badge_x = (width - badge_width) // 2
        badge_y = 120
        
        # 圆角矩形背景（用矩形模拟）
        draw.rounded_rectangle(
            [badge_x, badge_y, badge_x + badge_width, badge_y + badge_height],
            radius=20,
            fill=bg_color
        )
        
        # 标签文字
        text_x = badge_x + 30
        text_y = badge_y + 15
        draw.text((text_x, text_y), theme, font=font, fill=color)
    
    def _draw_title(self, draw: ImageDraw.Draw, title: str, width: int, height: int, style: dict):
        """绘制主标题"""
        font = self._get_font(120, bold=True)
        color = style["text"]
        
        # 获取文字边界
        bbox = draw.textbbox((0, 0), title, font=font)
        text_width = bbox[2] - bbox[0]
        
        x = (width - text_width) // 2
        y = height // 3 - 60
        
        # 文字阴影
        shadow_color = (*color[:3], 100) if len(color) == 4 else (*[c // 2 for c in color[:3]],)
        draw.text((x + 4, y + 4), title, font=font, fill=(0, 0, 0, 100))
        draw.text((x, y), title, font=font, fill=color)
    
    def _draw_subtitle(self, draw: ImageDraw.Draw, subtitle: str, width: int, height: int, style: dict):
        """绘制副标题/促销信息"""
        font = self._get_font(60)
        color = style["text"]
        
        bbox = draw.textbbox((0, 0), subtitle, font=font)
        text_width = bbox[2] - bbox[0]
        
        x = (width - text_width) // 2
        y = height // 2
        
        draw.text((x, y), subtitle, font=font, fill=color)
    
    def _draw_divider(self, draw: ImageDraw.Draw, width: int, height: int, style: dict):
        """绘制分隔线"""
        color = style["accent"]
        
        # 装饰性分隔线
        center_x = width // 2
        line_y = height * 2 // 3
        
        # 左右短线
        line_length = 80
        draw.line([center_x - line_length, line_y, center_x - 20, line_y], fill=color, width=3)
        draw.line([center_x + 20, line_y, center_x + line_length, line_y], fill=color, width=3)
        
        # 中间装饰点
        draw.ellipse([center_x - 8, line_y - 8, center_x + 8, line_y + 8], fill=color)
    
    def _draw_logo(
        self, 
        draw: ImageDraw.Draw, 
        store_name: str, 
        logo_text: Optional[str],
        width: int, 
        height: int, 
        style: dict
    ):
        """绘制店铺Logo"""
        font = self._get_font(48, bold=True)
        color = style["text"]
        
        # 店铺名称
        display_text = logo_text if logo_text else store_name
        bbox = draw.textbbox((0, 0), display_text, font=font)
        text_width = bbox[2] - bbox[0]
        
        x = (width - text_width) // 2
        y = height * 3 // 4 - 50
        
        draw.text((x, y), display_text, font=font, fill=color)
    
    def _draw_bottom_decoration(self, draw: ImageDraw.Draw, width: int, height: int, style: dict):
        """绘制底部装饰"""
        color = style["accent"]
        
        # 底部渐变条
        for i in range(30):
            alpha = int(255 * (i / 30))
            y = height - 60 + i * 2
            draw.rectangle([0, y, width, y + 2], fill=(*color[:3], alpha // 4))


def demo():
    """演示函数"""
    generator = PosterGenerator()
    
    # 生成多种风格的海报
    styles = ["romantic", "festival", "luxury", "fresh", "ocean"]
    
    print("🎨 正在生成海报演示...")
    
    for style in styles:
        url = generator.generate(
            theme="520情人节",
            title="甜蜜告白季",
            subtitle="限时8折 · 全场优惠",
            style=style,
            store_name="老码头火锅"
        )
        print(f"✅ {style}风格海报已生成: {url}")
    
    print("\n🎉 所有海报生成完成！")
    print(f"📁 文件保存在: {generator.output_dir}/")


if __name__ == "__main__":
    demo()
