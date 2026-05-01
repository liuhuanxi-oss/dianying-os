from setuptools import setup, find_packages

setup(
    name="dyos-platforms",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "click>=8.0.0",
        "requests>=2.28.0",
        "rich>=13.0.0",
        "tabulate>=0.9.0",
        "python-dateutil>=2.8.0",
    ],
    entry_points={
        "console_scripts": [
            "dyos-platform=dyos_platforms.cli:main",
        ],
    },
    python_requires=">=3.8",
)
