<?php

class Product
{
    public ?int $id = null;
    public string $name;
    public ?string $description = null;
    public float $cost_price;
    public float $sale_price;
    public int $category_id;
    public ?int $supplier_id = null;
    public int $minimum_stock;
}