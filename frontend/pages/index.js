import Header from "../components/Header"
import { Container, Heading, Box, Text, Link } from '@chakra-ui/react'
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import prisma from '../lib/prisma';
import Chart from '../components/Chart';

// eslint-disable-next-line @typescript-eslint/no-redeclare
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// This gets called on every request
export async function getServerSideProps() {

  const feed = await prisma.implied_volatility.findMany({
    where: {
      implied_volatility: {
        not: null,
      },
    }
  });

  return {
    props: { impliedVolItems: JSON.parse(JSON.stringify(feed)) },
  }
}

export default function Home({ impliedVolItems }) {

  return (
    <>
      <Header />
      <Box height='100vh' bg="#242730">
        <Container maxW='8xl' height='80vh' mt="4rem">
          <Heading ml='40px' as='i' size='md' color={'gray.100'}></Heading>
          <ParentSize>{({ width, height }) => <Chart data={impliedVolItems} />}</ParentSize>
        </Container>
      </Box>
    </>
  )
}