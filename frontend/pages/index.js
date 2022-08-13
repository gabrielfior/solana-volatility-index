import Header from "../components/Header"
import { Container, Heading, Box, Text, Link } from '@chakra-ui/react'
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import LineChart from '../components/LineChart';
import { data } from '../data/data';

export default function Home() {
  return (
    <>
      <Header />
      <Box height='100vh' bg="#242730">
        <Container maxW='8xl' height='80vh' mt="4rem" >
          <Heading ml='40px' as='i' size='md' color={'gray.100'}></Heading>
          <ParentSize>{({ width, height }) => <LineChart data={data} width={width} height={height} />}</ParentSize>
        </Container>
      </Box>
    </>
  )
}