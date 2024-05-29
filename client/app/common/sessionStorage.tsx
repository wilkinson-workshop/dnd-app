'use client'

function storage(){
    function getItem(key: string){
        if(typeof window !== 'undefined' && key){
            return sessionStorage.getItem(key)!;
        }
    }
    
    function setItem(key: string, value: string){
        if(typeof window !== 'undefined' && key ){
            sessionStorage.setItem(key, value);
        }
    }

    return {getItem, setItem};
}

export default storage
