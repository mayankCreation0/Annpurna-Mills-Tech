/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Grid, Box, Stack, Button, TextField, ToggleButtonGroup, ToggleButton, Accordion, AccordionSummary, AccordionDetails, MenuItem, Divider, Modal } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SwipeableButton } from 'react-swipeable-button';
import { getDetailsById, updateData } from '../Api/Apis';
import MaleImg from '../Assets/Profile/Ava_Male.jpg';
import FemaleImg from '../Assets/Profile/Ava_Female.jpg';
import CreateIcon from '@mui/icons-material/Create';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ViewPage = () => {
    const [customer, setCustomer] = useState(null);
    const [interest, setInterest] = useState(0);
    const [month, setMonth] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [paidDate, setPaidDate] = useState(new Date().toISOString().substr(0, 10));
    const { id } = useParams();
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const mode = useSelector((state) => state.mode);
    const [isEdit, setIsEdit] = useState(false);
    const [isLoanEdit, setIsLoanEdit] = useState(false);
    const [gender, setGender] = useState('');
    const [previousPayments, setPreviousPayments] = useState([]);
    const [newPayment, setNewPayment] = useState({ PaidAmount: '', PaidDate: '' });

    const fetchData = async () => {
        try {
            const res = await getDetailsById(id, dispatch, navigate);
            const fetchedCustomer = res.data;

            if (fetchedCustomer) {
                setCustomer(fetchedCustomer);
                setGender(fetchedCustomer.Gender);
                const endDate = fetchedCustomer.Status === 'Completed' ? fetchedCustomer.PaidLoan[0].LoanPaidDate : new Date();
                calculateMonthlySimpleInterest(fetchedCustomer.Amount, fetchedCustomer.Rate, fetchedCustomer.Date, endDate);
                calculateExactTimePeriod(fetchedCustomer.Date, endDate);
                setPaidAmount((parseFloat(fetchedCustomer.Amount) + parseFloat(fetchedCustomer.Interest || 0)).toFixed(2));
                setPreviousPayments(fetchedCustomer.PreviousPayments);
            }
        } catch (error) {
            console.error('Failed to fetch customer data:', error);
        }
    };



    function calculateExactTimePeriod(startDate, endDate = new Date()) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const years = end.getFullYear() - start.getFullYear();
        const months = end.getMonth() - start.getMonth();
        const days = end.getDate() - start.getDate();
        return `${years} years, ${months} months, ${days} days`;
    }


    function calculateMonthlySimpleInterest(principal, monthlyRate, startDate, endDate = new Date()) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const years = end.getFullYear() - start.getFullYear();
        const months = end.getMonth() - start.getMonth();
        const days = end.getDate() - start.getDate();
        let totalMonths = years * 12 + months;
        if (days > 10) {
            totalMonths += 1;
        }
        if (totalMonths < 1) {
            totalMonths = 1;
        }
        const simpleInterest = (principal * monthlyRate * totalMonths) / 100;
        setMonth(totalMonths);
        setInterest(simpleInterest);
        return simpleInterest;
    }

    const handleModalOpen = () => {
        setPaidAmount(customer.Amount + interest);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };
    const calculateTotalAmount = () => {
        let totalAmount = 0;
        previousPayments.forEach(payment => {
            totalAmount += payment.PaidAmount || 0;
        });
        return totalAmount;
    };

    const deletePayment = async (index) => {
        const updatedPayments = [...previousPayments];
        updatedPayments.splice(index, 1);
        await updateCustomerData({ ...customer, PreviousPayments: updatedPayments });
    };

    const addNewPayment = async () => {
        const updatedPayments = [...previousPayments, newPayment];
        await updateCustomerData({ ...customer, PreviousPayments: updatedPayments });
    };

    const updateCustomerData = async (updatedCustomer) => {
        try {
            await updateData(updatedCustomer, dispatch, navigate, id);
            setPreviousPayments(updatedCustomer.PreviousPayments);
            // Optionally handle success message or state update
        } catch (error) {
            console.error('Error updating customer data:', error);
            // Handle error scenario
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, dispatch]);

    if (!customer) {
        return <div className='flex justify-center items-center h-full w-full text-xl'>Loading...</div>;
    }

    const handleUpdate = async () => {
        await updateData(customer, dispatch, navigate, id);
        setIsEdit(false);
        setIsLoanEdit(false);
        window.location.reload();
    };
    const handleSwipeSuccess = async () => {
        const updatedPaidLoan = [...customer.PaidLoan, { loanPaidAmount: paidAmount, loanPaidDate: paidDate }];
        const updatedCustomer = { ...customer, PaidLoan: updatedPaidLoan, Status: 'Completed' };
        await updateData(updatedCustomer, dispatch, navigate, id);
        setCustomer(updatedCustomer);
        setIsModalOpen(false);
        window.location.reload();
    };

    return (
        <Box sx={{ padding: '20px', width: '100%', maxWidth: '1200px', margin: 'auto', backgroundColor: '#f7f9fc' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <img src={customer.Gender !== 'male' ? FemaleImg : MaleImg} alt='Profile' style={{ borderRadius: '50%', width: '100px', height: '100px', marginRight: '20px' }} />
                <Stack spacing={0.5}>
                    <Typography variant="h5" sx={{ fontWeight: '600', textTransform: 'capitalize' }}>
                        {customer.Name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: mode === 'light' ? 'black' : 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Box component={'span'} sx={{ position: 'relative', width: '13px', height: '7px' }}>
                            <Box component={'span'} className={`dot ${customer.Status.toLowerCase()}`} />
                        </Box>
                        {customer.Status}
                    </Typography>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Accordion defaultExpanded sx={{ borderLeft: '4px solid', borderColor: 'primary.main' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" sx={{ fontWeight: '600' }}>Loan Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginBottom: '10px' }}>
                                <Button onClick={() => setIsLoanEdit(!isLoanEdit)} startIcon={<CreateIcon />}>
                                    {isLoanEdit ? 'Cancel' : 'Edit'}
                                </Button>
                            </Stack>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">Category:</Typography>
                                        {isLoanEdit ? (
                                            <TextField
                                                select
                                                value={customer.Category}
                                                onChange={(e) => setCustomer({ ...customer, Category: e.target.value })}
                                                fullWidth
                                                label="Category"
                                            >
                                                <MenuItem value="Gold">Gold</MenuItem>
                                                <MenuItem value="Silver">Silver</MenuItem>
                                                <MenuItem value="Bronze">Kansa</MenuItem>
                                                <MenuItem value="Bike">Bike</MenuItem>
                                                <MenuItem value="Cycle">Cycle</MenuItem>
                                                <MenuItem value="Others">Others</MenuItem>
                                            </TextField>
                                        ) : (
                                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                {customer.Category}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">Product Details:</Typography>
                                        {isLoanEdit ? (
                                            <TextField
                                                value={customer.Remarks}
                                                onChange={(e) => setCustomer({ ...customer, Remarks: e.target.value })}
                                                fullWidth
                                                label="Product Details"
                                            />
                                        ) : (
                                            <Typography variant="body2">
                                                {customer.Remarks || '-'}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">Loan Date:</Typography>
                                        {isLoanEdit ? (
                                            <TextField
                                                type="date"
                                                value={customer.Date.substr(0, 10)}
                                                onChange={(e) => setCustomer({ ...customer, Date: e.target.value })}
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        ) : (
                                            <Typography variant="body2">
                                                {customer.Date.substr(0, 10)}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">Loan Amount:</Typography>
                                        {isLoanEdit ? (
                                            <TextField
                                                value={customer.Amount}
                                                onChange={(e) => setCustomer({ ...customer, Amount: e.target.value })}
                                                fullWidth
                                                label="Loan Amount"
                                            />
                                        ) : (
                                            <Typography variant="body2">
                                                ₹{customer.Amount}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">Rate:</Typography>
                                        {isLoanEdit ? (
                                            <TextField
                                                value={customer.Rate}
                                                onChange={(e) => setCustomer({ ...customer, Rate: e.target.value })}
                                                fullWidth
                                                label="Rate"
                                            />
                                        ) : (
                                            <Typography variant="body2">
                                                {customer.Rate}%
                                            </Typography>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">Time Period:</Typography>
                                        <Typography variant="body2">
                                            {month} months ~({calculateExactTimePeriod(customer.Date, customer.Status === 'Completed' ? customer.PaidLoan[0].LoanPaidDate : new Date())})
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">Interest:</Typography>
                                        <Typography variant="body2">
                                            ₹{interest.toFixed(2)}
                                        </Typography>
                                    </Stack>
                                </Grid>



                                <Grid item xs={12}>
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="h6" sx={{ fontWeight: '600' }}>
                                                Old Payments
                                                <span style={{ marginLeft: '15px', color: '#1976d2' }}>
                                                    net: ₹{calculateTotalAmount()}
                                                </span>
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {previousPayments.map((payment, index) => (
                                                <Stack key={index} direction="row" justifyContent="space-between" alignItems="center" sx={{ marginBottom: '10px' }}>
                                                    <>
                                                        <Typography variant="body2">Amount: ₹{payment.PaidAmount}</Typography>
                                                        <Typography variant="body2">Date: {new Date(payment.PaidDate).toISOString().substr(0, 10)}</Typography>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={() => deletePayment(index)}
                                                        >

                                                        </Button>
                                                    </>
                                                </Stack>
                                            ))}
                                            {previousPayments.length === 0 && (
                                                <Typography variant="body2">No previous payments available.</Typography>
                                            )}
                                            <Stack direction="row" alignItems="center" sx={{ marginTop: '10px' }}>
                                                <TextField
                                                    value={newPayment.PaidAmount}
                                                    onChange={(e) => setNewPayment({ ...newPayment, PaidAmount: e.target.value })}
                                                    label="Amount"
                                                    sx={{ marginRight: '10px', width: '120px' }}
                                                />
                                                <TextField
                                                    type="date"
                                                    value={newPayment.PaidDate}
                                                    onChange={(e) => setNewPayment({ ...newPayment, PaidDate: e.target.value })}
                                                    label="Date"
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ marginRight: '10px', width: '120px' }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<AddIcon />}
                                                    onClick={addNewPayment}
                                                >Add
                                                </Button>
                                            </Stack>
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>

                                {customer.Status !== 'Completed' ? <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Due Amount:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                                            ₹{customer.Amount} + ₹{interest.toFixed(2)} - ₹{calculateTotalAmount()} = {((parseFloat(customer.Amount) + parseFloat(interest)).toFixed(2) - parseFloat(calculateTotalAmount())).toFixed(2)}
                                        </Typography>
                                    </Stack>
                                </Grid> : null}


                                <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                                    {customer.Status === 'Completed' ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                Loan Paid: ₹ {customer.PaidLoan[0].loanPaidAmount}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                                                Paid Date: {new Date(customer.PaidLoan[0].LoanPaidDate).toISOString().substr(0, 10)}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={handleModalOpen}
                                            sx={{ width: '100%' }}
                                        >
                                            Mark as Paid
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                            {isLoanEdit && (
                                <Stack direction="row" justifyContent="center" alignItems="center" sx={{ marginTop: '20px' }}>
                                    <Button onClick={handleUpdate} variant="contained" color="primary" startIcon={<AutoFixHighIcon />}>
                                        Update
                                    </Button>
                                </Stack>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Accordion defaultExpanded sx={{ borderLeft: '4px solid', borderColor: 'secondary.main' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" sx={{ fontWeight: '600' }}>Personal Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginBottom: '10px' }}>
                                <Button onClick={() => setIsEdit(!isEdit)} startIcon={<CreateIcon />}>
                                    {isEdit ? 'Cancel' : 'Edit'}
                                </Button>
                            </Stack>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">Phone:</Typography>
                                        {isEdit ? (
                                            <TextField
                                                value={customer.Phone}
                                                onChange={(e) => setCustomer({ ...customer, Phone: e.target.value })}
                                                fullWidth
                                                label="Phone"
                                            />
                                        ) : (
                                            <Typography variant="body2">
                                                {customer.PhoneNumber}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">Address:</Typography>
                                        {isEdit ? (
                                            <TextField
                                                value={customer.Address}
                                                onChange={(e) => setCustomer({ ...customer, Address: e.target.value })}
                                                fullWidth
                                                label="Address"
                                            />
                                        ) : (
                                            <Typography variant="body2">
                                                {customer.Address}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">Gender:</Typography>
                                        {isEdit ? (
                                            <ToggleButtonGroup
                                                value={customer.Gender}
                                                exclusive
                                                onChange={(e, value) => {
                                                    if (value !== null) {
                                                        setCustomer({ ...customer, Gender: value });
                                                        setGender(value);
                                                    }
                                                }}
                                            >
                                                <ToggleButton value="male">
                                                    <MaleIcon /> Male
                                                </ToggleButton>
                                                <ToggleButton value="female">
                                                    <FemaleIcon /> Female
                                                </ToggleButton>
                                            </ToggleButtonGroup>
                                        ) : (
                                            <Typography variant="body2">
                                                {customer.Gender}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Grid>
                            </Grid>
                            {isEdit && (
                                <Stack direction="row" justifyContent="center" alignItems="center" sx={{ marginTop: '20px' }}>
                                    <Button onClick={handleUpdate} variant="contained" color="primary" startIcon={<AutoFixHighIcon />}>
                                        Update
                                    </Button>
                                </Stack>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>
            <Modal
                open={isModalOpen}
                onClose={handleModalClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={{ ...modalStyle }}>
                    <Typography id="modal-title" variant="h6" component="h2">
                        Confirm Payment
                    </Typography>
                    <TextField
                        label="Paid Amount"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Paid Date"
                        type="date"
                        value={paidDate}
                        onChange={(e) => setPaidDate(e.target.value)}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                    <SwipeableButton
                        text='Swipe to confirm payment'
                        color='#4CAF50'
                        onSuccess={handleSwipeSuccess}
                    />
                </Box>
            </Modal>
        </Box>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
export default ViewPage;
