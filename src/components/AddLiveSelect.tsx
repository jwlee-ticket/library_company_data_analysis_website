import { useState } from 'react'

import { FormControl, InputLabel, Select, MenuItem, OutlinedInput } from '@mui/material'

export default function AddLiveSelect({
  selectedUser,
  setSelectedUser,
  liveList
}: {
  selectedUser: any
  setSelectedUser: (user: any) => void
  liveList: string[]
}) {
  const [selectValue, setSelectValue] = useState('')

  return (
    <FormControl fullWidth>
      <InputLabel>추가할 공연</InputLabel>
      <Select
        label='추가할 공연'
        value={selectValue}
        onChange={e => {
          const newLiveId = e.target.value as string

          // 만약 이미 추가되어 있으면 아무 동작도 하지 않음
          if (selectedUser.liveNameList?.includes(newLiveId)) return
          setSelectedUser({
            ...selectedUser,
            liveNameList: [...(selectedUser.liveNameList || []), newLiveId]
          })

          // 선택 후 값을 초기화
          setSelectValue('')
        }}
        input={<OutlinedInput label='추가할 공연' />}
      >
        {liveList.map(live => (
          <MenuItem key={live} value={live} sx={{ display: 'flex', gap: 1 }}>
            {live}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
