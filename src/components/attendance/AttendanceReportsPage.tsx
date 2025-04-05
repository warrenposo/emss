
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Download, Filter } from "lucide-react";

const AttendanceReportsPage = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Attendance Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <p className="text-muted-foreground text-sm">Average attendance rate</p>
            <div className="mt-2 flex justify-end">
              <Button size="sm" variant="ghost">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Department Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>IT Department</span>
                  <span className="font-medium">96%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "96%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>HR Department</span>
                  <span className="font-medium">88%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "88%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Finance</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "94%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Absence Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sick Leave</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  45%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Vacation</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  30%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Personal</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  15%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Other</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  10%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Report</CardTitle>
          <CardDescription>
            Detailed attendance statistics for the current month
          </CardDescription>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Working Days</p>
              <p className="text-2xl font-bold">22</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Present Days (Avg)</p>
              <p className="text-2xl font-bold">20.3</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Absent Days (Avg)</p>
              <p className="text-2xl font-bold">1.7</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReportsPage;
