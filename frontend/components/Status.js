import React from 'react';
import {
  Grid,
  Item,
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const Status = ({ status }) => {
  return (
    <>
      {status.length === 0 ? (
          <Typography>Loading Status...</Typography>
      ) : (
        <Card>
          <CardHeader title="STATUS" />
          <CardContent>
            <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 300, maxWidth: 400 }}
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Title</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {status.map((item) => (
                    <TableRow
                      key={item[0]}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row" align="right">
                        {item[0]}
                      </TableCell>
                      <TableCell component="th" scope="row" align="right">
                        {item[1]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Status;
