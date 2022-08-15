import { main } from './main';

export async function hello(event) {
    console.log('starting job', new Date());
    
    try {
        await main();
        console.log('finished job');    
    } catch (error) {
        console.error('error', error);
    }   

    return {
        message: 'finished',
        input: event,
    };
}