
setInterval(()=>{
   

    fetch('/blockChecker', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ }),
    })
        .then(response => response.json())
        .then(data => {
    
            if (data) {
    
                location.reload()
            } 
            
        })
        .catch(error => {
            console.error('Error:', error);
        });
    


},4000)

 
