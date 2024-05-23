import React, { useEffect, useState } from 'react';
import { BarChart, axisClasses } from '@mui/x-charts';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useDispatch, useSelector } from 'react-redux';
import { getAnalytics } from '../Api/Apis';

export default function LoanAmountBarChart() {
    const [data, setData] = useState({ yearly: [], monthly: [] });
    const [chartType, setChartType] = useState('monthly'); // 'monthly' or 'yearly'

    const loading = useSelector(state => state.loading);
    const analytics = useSelector(state => state.analytics);
    const dispatch = useDispatch();

    const fetchData = async () => {
        const response = await getAnalytics(dispatch);
        console.log("Analytics", response.data);
        const { yearlyLoanRepaidData, monthlyLoanRepaidData } = response.data;
        setData({ yearly: yearlyLoanRepaidData, monthly: monthlyLoanRepaidData });
    };

    useEffect(() => {
        if (!analytics) {
            fetchData();
        } else {
            const { yearlyLoanRepaidData, monthlyLoanRepaidData } = analytics;
            setData({ yearly: yearlyLoanRepaidData, monthly: monthlyLoanRepaidData });
        }
    }, [analytics]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const createChartData = (data, type) => {
        if (type === 'yearly') {
            return data.map(item => ({ time: item._id.year, amount: item.totalLoanRepaidAmount }));
        }
        return data.map(item => ({
            time: `${item.year}-${item.month}`,
            amount: item.totalLoanRepaidAmount
        }));
    };

    const chartData = createChartData(data[chartType], chartType);

    return (
        <>
            <React.Fragment>
                <ButtonGroup
                    variant="contained"
                    color="primary"
                    aria-label="outlined primary button group"
                    sx={{ mb: 2 }}
                >
                    <Button
                        onClick={() => setChartType('monthly')}
                        sx={{ textTransform: 'none', borderRadius: '8px' }}
                    >
                        Monthly
                    </Button>
                    <Button
                        onClick={() => setChartType('yearly')}
                        sx={{ textTransform: 'none', borderRadius: '8px' }}
                    >
                        Yearly
                    </Button>
                </ButtonGroup>
                <div style={{ width: '100%', flexGrow: 1, overflow: 'hidden', padding: '16px', background: '#f0f0f0', borderRadius: '8px' }}>
                    <BarChart
                        dataset={chartData}
                        xAxis={[
                            { scaleType: 'band', dataKey: 'time', tickPlacement: 'middle', tickLabelPlacement: 'middle' },
                        ]}
                        yAxis={[
                            { label: 'Loan Amount', labelStyle: { fill: '#000' }, tickLabelStyle: { fill: '#000' } }
                        ]}
                        series={[
                            { dataKey: 'amount', color: '#1976d2' }
                        ]}
                        height={300}
                        sx={{
                            [`& .${axisClasses.directionY} .${axisClasses.label}`]: {
                                transform: 'translateX(-10px)',
                            },
                        }}
                    />
                </div>
            </React.Fragment>
        </>
    );
}