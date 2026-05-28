#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - 安装配置
"""
from setuptools import setup, find_packages
import os

# 读取README
here = os.path.abspath(os.path.dirname(__file__))
readme_path = os.path.join(here, 'README.md')
if os.path.exists(readme_path):
    with open(readme_path, encoding='utf-8') as f:
        long_description = f.read()
else:
    long_description = "店赢OS天阙支付CLI工具"

setup(
    name='dyos-payment',
    version='1.0.0',
    description='店赢OS天阙支付CLI工具 - Agent-First支付能力封装',
    long_description=long_description,
    long_description_content_type='text/markdown',
    author='DianYing OS Team',
    author_email='liuhuanxi@outlook.com',
    url='https://github.com/liuhuanxi-oss/dianying-os',
    project_urls={
        'Documentation': 'https://github.com/liuhuanxi-oss/dianying-os/tree/main/cli/dyos-payment',
        'Source': 'https://github.com/liuhuanxi-oss/dianying-os',
        'Bug Tracker': 'https://github.com/liuhuanxi-oss/dianying-os/issues',
    },
    packages=find_packages(exclude=['tests', 'tests.*']),
    package_data={
        'dyos_payment': ['py.typed'],
    },
    include_package_data=True,
    python_requires='>=3.8',
    install_requires=[
        'click>=8.0.0',
        'requests>=2.25.0',
        'cryptography>=3.4.0',
    ],
    extras_require={
        'dev': [
            'pytest>=6.0',
            'pytest-cov>=2.0',
            'black>=21.0',
            'flake8>=3.9',
            'mypy>=0.910',
        ],
    },
    entry_points={
        'console_scripts': [
            'dyos-payment=dyos_payment.cli:main',
        ],
    },
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Topic :: Financial :: Point-Of-Sale',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
        'Natural Language :: Chinese',
        'Natural Language :: English',
    ],
    keywords='payment tianque suixingpay cli agent dyos dianying',
    zip_safe=False,
)
