def lambda_handler(event, context):
    message = 'Hello {}!'.format(event)  
    return { 
        'message' : message
    }