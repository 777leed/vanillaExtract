function performSearchAndReturnLinks(query) {
    var apiKey = 'AIzaSyBTeNmd_NhI3bexlNBRagD0KU1YKH_n1Vo';
    var cx = '805e28d7ed95f443b';
    var typeSearch = 'image';
    var url = 'https://www.googleapis.com/customsearch/v1?key=' + apiKey + '&cx=' + cx + '&q=' + query + '&searchType=' + typeSearch + '&imgType=clipart&imgColorType=trans';
    
    
    return fetch(url)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(function(data) {
            
            return data.items ? data.items.map(function(item) {
                return item.link;
            }) : [];
        })
        .catch(function(error) {
            console.error('Error fetching search results:', error);
            return []; 
        });
}

performSearchAndReturnLinks('heart')
    .then(function(links) {
        
        if (links.length > 0) {
            console.log('Links to images:', links);
        } else {
            console.log('No images found');
        }
    });
