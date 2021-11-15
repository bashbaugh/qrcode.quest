import { extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
  colors: {
    primary: { // https://hihayk.github.io/scale/#4/4/40/80/-0/0/-0/0/b02ff1/176/47/241/white
      100: '#EFD5FC',
      200: '#DFACF9',
      300: '#D082F7',
      400: '#C059F4',
      500: '#B02FF1',
      600: '#9E2AD9',
      700: '#8D26C1',
      800: '#7B21A9',
      900: '#6A1C91',
    },
    secondary: { // https://hihayk.github.io/scale/#4/4/40/80/-0/0/-0/0/FF7C30/255/124/48/white
      100: '#DDD5FC',
      200: '#BBACF9',
      300: '#9882F7',
      400: '#7659F4',
      500: '#542FF1',
      600: '#4C2AD9',
      700: '#4326C1',
      800: '#3B21A9',
      900: '#321C91',
    }
    // accent: { // https://hihayk.github.io/scale/#4/4/40/80/-0/0/-0/0/FF30B0/255/48/176/white
    //   100: '#FFD6EF',
    //   200: '#FFACDF',
    //   300: '#FF83D0',
    //   400: '#FF59C0',
    //   500: '#FF30B0',
    //   600: '#E62B9E',
    //   700: '#CC268D',
    //   800: '#B3227B',
    //   900: '#991D6A',
    // },
  },
})

export default theme
