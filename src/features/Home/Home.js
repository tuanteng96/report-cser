import React, { useEffect } from 'react'
import { Button } from 'react-bootstrap'
import producsApi from '../../api/products.api'

export default function Home() {
  useEffect(() => {
    producsApi.getAllProduct().then(response => {
      console.log(response)
    })
  }, [])
  return (
    <div>
      Home <Button variant="primary">Bấm vào đây</Button>
    </div>
  )
}
