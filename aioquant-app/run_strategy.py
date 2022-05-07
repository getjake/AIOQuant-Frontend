# -*- coding:utf-8 -*-
# Start main strategy!
from aioquant import quant



def initialize():
    from demo_strategy import MyStrategy
    MyStrategy()


if __name__ == "__main__":
    config_file = "strategy_config.json"
    quant.start(config_file, initialize)
