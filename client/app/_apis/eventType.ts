export enum EventType{
    RequestRoll = 'request_roll',
    ReceiveRoll = 'receive_roll',
    ReceiveMessage = 'receive_message',
    ReceiveOrderUpdate = 'receive_order_update',
    ReceiveClientId = 'receive_client_uuid',
    EndSession = 'end_session',
    JoinSession = 'join_session'
}

export enum SubscriptionEventType{
    JoinSession = 'join_session',
}

export interface WebsocketEvent { event_type: EventType, event_body: any }