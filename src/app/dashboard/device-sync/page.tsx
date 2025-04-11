"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { zktecoService } from "@/services/zkteco"
import { toast } from "sonner"

export default function DeviceSyncPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [userRecords, setUserRecords] = useState<any[]>([])

  const handleConnect = async () => {
    try {
      setIsLoading(true)
      const response = await zktecoService.connect()
      if (response.success) {
        toast.success("Successfully connected to device")
        setDeviceInfo(response.data)
      } else {
        toast.error(response.message || "Failed to connect to device")
      }
    } catch (error) {
      toast.error("An error occurred while connecting to the device")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetAttendance = async () => {
    try {
      setIsLoading(true)
      const response = await zktecoService.getAttendance()
      if (response.success) {
        toast.success(`Retrieved ${response.data.length} attendance records`)
        setAttendanceRecords(response.data)
      } else {
        toast.error(response.message || "Failed to get attendance records")
      }
    } catch (error) {
      toast.error("An error occurred while getting attendance records")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetUsers = async () => {
    try {
      setIsLoading(true)
      const response = await zktecoService.getUsers()
      if (response.success) {
        toast.success(`Retrieved ${response.data.length} user records`)
        setUserRecords(response.data)
      } else {
        toast.error(response.message || "Failed to get user records")
      }
    } catch (error) {
      toast.error("An error occurred while getting user records")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Device Sync</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Connection</CardTitle>
            <CardDescription>Connect to and manage your ZKTeco device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={handleConnect} disabled={isLoading}>
                {isLoading ? "Connecting..." : "Connect to Device"}
              </Button>
              <Button onClick={handleGetAttendance} disabled={isLoading}>
                {isLoading ? "Loading..." : "Get Attendance"}
              </Button>
              <Button onClick={handleGetUsers} disabled={isLoading}>
                {isLoading ? "Loading..." : "Get Users"}
              </Button>
            </div>

            {deviceInfo && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Device Information</h3>
                <pre className="bg-gray-100 p-4 rounded-md">
                  {JSON.stringify(deviceInfo, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {attendanceRecords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Recent attendance data from the device</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Timestamp</th>
                      <th>Status</th>
                      <th>Verify Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record, index) => (
                      <tr key={index}>
                        <td>{record.user_id}</td>
                        <td>{new Date(record.timestamp).toLocaleString()}</td>
                        <td>{record.status}</td>
                        <td>{record.verify_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {userRecords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>User Records</CardTitle>
              <CardDescription>User data stored on the device</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRecords.map((record, index) => (
                      <tr key={index}>
                        <td>{record.user_id}</td>
                        <td>{record.name}</td>
                        <td>{record.role}</td>
                        <td>{record.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 