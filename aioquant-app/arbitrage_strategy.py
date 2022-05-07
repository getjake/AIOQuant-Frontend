# -*- coding:utf-8 -*-

from aioquant.datas.market_data import SpreadData
from aioquant.event import EventSpread
from aioquant.utils.warning import WarningSubscribe, WarningMessage
from aioquant import const
from aioquant import quant
from aioquant.utils import logger, tools
from aioquant.configure import config
from aioquant.utils.command import CommandPublish, CommandSubscribe
from aioquant.market import Orderbook
from aioquant.market import Funding
from aioquant.trade import Trade
from aioquant.position import Position
from aioquant.order import Order
from aioquant.asset import Asset
from aioquant.order import ORDER_ACTION_BUY, ORDER_ACTION_SELL
from aioquant.order import (ORDER_STATUS_SUBMITTED,
                            ORDER_STATUS_PARTIAL_FILLED,
                            ORDER_STATUS_FILLED,
                            ORDER_STATUS_CANCELED,
                            ORDER_STATUS_FAILED)
from aioquant.order import (ORDER_TYPE_LIMIT,
                            ORDER_TYPE_MARKET,
                            ORDER_TYPE_IOC,
                            ORDER_TYPE_FOK,
                            ORDER_TYPE_POST_ONLY)
from aioquant.order import (ORDER_ACTION_BUY,
                            ORDER_ACTION_SELL,
                            TRADE_TYPE_BUY_OPEN,
                            TRADE_TYPE_SELL_OPEN,
                            TRADE_TYPE_SELL_CLOSE,
                            TRADE_TYPE_BUY_CLOSE)
from aioquant.error import Error
from aioquant.tasks import SingleTask, LoopRunTask
from aioquant.utils.decorator import async_method_locker
from aioquant.utils.tools import TranslateQuantity
from aioquant.utils.mongo import MongoDBBase
from aioquant.markets.binance_swap import BinanceSwapMarket as BinanceSwapMarket
from aioquant.markets.gate_swap import GateSwapMarket as GateSwapMarket
from aioquant.markets.huobi_swap import HuobiSwapMarket as HuobiSwapMarket
from aioquant.markets.okex_swap import OKExSwapMarket as OkexSwapMarket
from aioquant.markets.okex_swap_v5 import OKExV5SwapMarket as OKExV5SwapMarket

class MyStrategy:
    """
    For Test Websocket Connection to the frontend.
    """
    def __init__(self):
        """
        初始化
        """
        # 初始化变量

        SingleTask.run(self.initialize) # 初始化

    async def initialize(self, *args, **kwargs):
        """ Initialize the strategy with several functions.
        """

        cc = {
            "symbols" :[{"name": ["BTC-USDT-SWAP","ETH-USDT-SWAP"],"type":"swap"}],
            "channels" :['orderbook'],
            "orderbook_refresh": config.ORDERBOOK_REFRESH, # False -> incremental, True: 全量
            "platform":'binance_swap',
            "orderbook_update_callback":self.on_event_orderbook_update,
            "orderbook_length": config.ORDERBOOK_LENGTH,
        }
        BinanceSwapMarket(**cc)
        
        CommandSubscribe(self.on_event_command_callback)
        LoopRunTask.register(self.publish_command, 5)

    async def publish_command(self, *args, **kwargs):
        # logger.info("Running publish_command::")
        target = "frontend"
        timestamp = tools.get_cur_timestamp()
        message = {
            "main": "The msg is sent via `publish_command` function.",
            "timestamp": timestamp
        }
        CommandPublish.publish(target=target, message=message)


    @async_method_locker("on_event_init_callback.locker", timeout=15)
    async def on_event_command_callback(self, data, **kwargs):
        target = data.target
        if target == 'backend':
           message = data.message
           logger.info("I received a msg from frontend::: ", message)

    @async_method_locker("on_event_init_callback.locker", timeout=15)
    async def on_event_init_callback(self, success: bool, **kwargs):
        """各交易所各交易对的trade对象初始化是否成功
        """
        logger.info("success:", success, "kwargs:", kwargs, caller=self)

    @async_method_locker("on_event_error_callback.locker", timeout=15)
    async def on_event_error_callback(self, error, **kwargs):
        """
        各交易所各交易对trade对象运行错误回调
        """
        logger.info("error:", error, "kwargs:", kwargs, caller=self)

    # @async_method_locker("on_event_orderbook_update.locker", timeout=15)
    async def on_event_orderbook_update(self, orderbook: Orderbook):
        """
        订单薄更新回调
        self.orderbook 本地记录
        """
        # Update orderbook -> local
        # key = f"{orderbook.platform}${orderbook.symbol}"
        # logger.info("Orderbook has been received!")
        # logger.info(orderbook)
        pass
       
