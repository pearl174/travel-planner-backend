app.get('getDestinations/:id', (req, res) => {
    const id = req.params.id;
    res.send(`Received id: ${id}`); 
})