'use client' // to make it client sided app 
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Button, Box, Modal, TextField, Typography, Stack, ThemeProvider, createTheme, Card, CardContent, Divider } from "@mui/material";
import { collection, getDocs, query, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Analytics } from "@vercel/analytics/react"


const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#FF3298",
    },
    secondary: {
      main: "#b2276c"
      //main: "#FFC0CB",
    },
    success: {
      main: "#91FB91"
    },
    typography: {
      /*h2: {
        fontWeight: 'bold',
        fontFamily: 'Raleway,Arial, sans-serif',

      },*/
      //fontFamily: 'Raleway,Arial, sans-serif',

    },
    background: {

      //default: "#2f3940",
      default: "#fbfbeb",
      paper: "#fbfbeb",
    }
  }
})

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach(doc => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setSearchResults(inventoryList);
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  }

  useEffect(() => {
    updateInventory();
  }, [])

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSearch = (e) => {
    const item = e.target.value.toLowerCase();
    setSearchItem(item);
    if (item === '') {
      setSearchResults(inventory);
    } else {
      setSearchResults(
        inventory.filter(result => result.name.toLowerCase().includes(item))
      );
    }
  }

  return (

    <ThemeProvider theme={theme}>
      <Box
        width="100%"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
        gap={2}
        //bgcolor="#2f3940"
        sx={{
          backgroundImage: 'url(/img/pink-pantry.png)',

        }}

      >

        <Box width="100%" display="flex" alignItems="center" padding={2} bgcolor="#fbfbeb">
          <img src="/img/pink-pantry.png" alt="logo" style={{ height: 50, marginRight: 16 }}></img>
          <Typography variant="h5">
            Pantry Tracker
          </Typography>


          <TextField
            label="Search your pantry"
            variant="outlined"
            value={searchItem}
            onChange={handleSearch}
            color="primary"
            sx={{ width: '100%', maxWidth: '550px', ml: 4 }}
          />



        </Box>


        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute" top="50%" left="50%"
            width={400}
            bgcolor="#fbfbeb"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: 'translate(-50%, -50%)',
            }}>
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary" sx={{ fontWeight: 'bold' }}
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>




        <Card variant="outlined" sx={{ width: '100%', maxWidth: '800px', mt: 5, mb:2}}>
          <CardContent>


            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Inventory Items</Typography>
              <Button
                variant="contained"
                onClick={handleOpen}
                sx={{
                  minHeight: "50px",

                  fontWeight: "bold",

                }}
              >
                Add New Item
              </Button>
            </Stack>



          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ width: '100%', maxWidth: '800px', mb:-1.1}}>
        <CardContent>
        <Stack direction="row" justifyContent="space-between"  >
              <Typography variant="h6" fontWeight="bold">Item</Typography>
              <Typography variant="h6" fontWeight="bold">Quantity</Typography>
              <Typography variant="h6" fontWeight="bold">Actions</Typography>
            </Stack>
        </CardContent>
        </Card>

        <Card variant="outlined" sx={{ width: '100%', maxWidth: '800px', height: '400px', overflow: 'auto' }}>
          <CardContent>

            <Stack spacing={2} mt={2}>
              {searchResults.map(({ name, quantity }) => (
                
                <Box key={name}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ width: '25%' }}>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                    <Typography variant="h6" >{quantity}</Typography>
                    <Stack direction="row" spacing={3}>
                      <Button variant="contained" startIcon={<RemoveIcon />} color="secondary" sx={{ fontWeight: 'bold' }} onClick={() => removeItem(name)}>Remove</Button>

                      <Button variant="contained" startIcon={<AddIcon />} color="primary" sx={{ fontWeight: 'bold' }} onClick={() => addItem(name)}>Add</Button>
                    </Stack>
                  </Stack>
                  <Divider sx={{ my: 3 }} />
                </Box>


              ))}
            </Stack>
          </CardContent>
        </Card>



      </Box>
      <Analytics />
    </ThemeProvider>
  );
}

