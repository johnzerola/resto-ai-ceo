
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCcw } from "lucide-react";

interface DatabaseTabProps {
  isLoading: boolean;
  tables: any[];
  onRefresh: () => void;
}

export function DatabaseTab({ isLoading, tables, onRefresh }: DatabaseTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Tabelas do Sistema</CardTitle>
            <CardDescription>
              Informações sobre as tabelas no banco de dados
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Registros</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Última Atualização</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => (
              <TableRow key={table.name}>
                <TableCell className="font-medium">{table.name}</TableCell>
                <TableCell>{table.rows}</TableCell>
                <TableCell>{table.size}</TableCell>
                <TableCell>{new Date(table.lastUpdated).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {tables.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  {isLoading ? "Carregando..." : "Nenhuma tabela encontrada"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
