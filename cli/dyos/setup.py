"""
店赢OS CLI工具 - setup.py
"""
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="dyos",
    version="1.0.0",
    author="店赢OS团队",
    author_email="support@dianying-os.com",
    description="店赢OS CLI - AI门店运营SaaS平台管理工具",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/liuhuanxi-oss/dianying-os",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.8",
    install_requires=[
        "click>=8.0.0",
        "requests>=2.28.0",
        "rich>=13.0.0",
    ],
    entry_points={
        "console_scripts": [
            "dyos=dyos.cli:cli",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)
