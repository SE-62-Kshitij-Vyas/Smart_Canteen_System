// https://script.google.com/macros/s/AKfycbxghJ8XtgknUS4Cjxus0zPy2i_cKi642BSfUPFUIkis-tYb_QvGbCMMR822Kv5zLh0e/exec


        const url = "https://script.google.com/macros/s/AKfycbx2nfHpmwofqz4gukIdM41Z5Krn-V54wN6Db75moXlIT0L82ArLmCc2uL_VU235nSkj/exec" // enter your public ('access' - 'anyone') deployment URL (NOT test deployment!)
        document.getElementById('form').action = url;

        // fetching the data from each column in the sheet
        // then populating the respective datalist
        fetch(`${url}?header=username`)
            .then((response) => response.json())
            .then(({ data }) => {
                console.log(data);
                populateDatalists("username", data)
            })
            .catch((error) => console.error('!!!!!!!!', error));

        fetch(`${url}?header=email address`)
            .then((response) => response.json())
            .then(({ data }) => {
                console.log(data);
                populateDatalists("email address", data)
            })
            .catch((error) => console.error('!!!!!!!!', error));
        
        fetch(`${url}?header=password`)
            .then((response) => response.json())
            .then(({ data }) => {
                console.log(data);
                populateDatalists("password", data)
            })
            .catch((error) => console.error('!!!!!!!!', error));
            fetch(`${url}?header=phone number`)
            .then((response) => response.json())
            .then(({ data }) => {
                console.log(data);
                populateDatalists("phone number", data)
            })
            .catch((error) => console.error('!!!!!!!!', error));


    