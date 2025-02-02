import { ServerData } from '@/types'
import React from 'react'
import Guage from './Guage'
import { Typography } from '@mui/material'

type Props = {
    status: ServerData,
    theme: any
}

const ServerStats = (props: Props) => {
  return (
    <div className='flex p-5 flex-col items-center xl:flex-row'>
      <Guage theme={props.theme} title={"CPU"} active={props.status.active} value={props.status.status?.cpu_usage_percentage} valueMax={100} />
      <Guage theme={props.theme} title={"Memory"} active={props.status.active} value={props.status.status?.used_memory_in_KB} valueMax={props.status.status?.total_memory_in_KB} />
      <Guage theme={props.theme} title={"Disk"} active={props.status.active} value={props.status.status?.used_disk_in_KB} valueMax={props.status.status?.total_disk_in_KB} />
    </div>
  )
}

export default ServerStats
