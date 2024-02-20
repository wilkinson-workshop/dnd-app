export enum EventType{
    RequestRoll = 'request_roll',
    ReceiveRoll = 'receive_roll',
    ReceiveMessage = 'receive_message',
    ReceiveOrderUpdate = 'receive_order_update',
    ReceiveClientId = 'receive_client_uuid'
}

export enum SubscriptionEventType{
    JoinSession = 'join_session',
}