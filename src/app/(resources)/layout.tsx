"use client"

import { mutate } from 'swr';
import { useClusters } from "../context"
import { ClusterMembersKey, ObjectsKey } from "@/apis/hooks"
import SearchBar from '@/components/SearchBar';
import { Button } from '@mui/material';
import { createObject } from '@/apis/object';
export default function Layout({ children, }: { children: React.ReactNode }) {
    const { currentCluster } = useClusters()

    return (<div>
        {children}
    </div>)
}