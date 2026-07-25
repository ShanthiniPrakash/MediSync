package com.medisync.controller;

import com.medisync.dto.PharmacyInventoryRequest;
import com.medisync.entity.PharmacyInventory;
import com.medisync.service.PharmacyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/pharmacy")
public class PharmacyController {

    @Autowired
    private PharmacyService pharmacyService;

    @GetMapping("/inventory")
    public ResponseEntity<List<PharmacyInventory>> getInventory(
            @RequestParam("hospitalId") Long hospitalId,
            @RequestParam(value = "search", required = false) String search) {
        List<PharmacyInventory> response;
        if (search != null && !search.trim().isEmpty()) {
            response = pharmacyService.searchInventory(hospitalId, search);
        } else {
            response = pharmacyService.getInventoryByHospital(hospitalId);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/inventory")
    public ResponseEntity<PharmacyInventory> addInventoryItem(@Valid @RequestBody PharmacyInventoryRequest request) {
        PharmacyInventory response = pharmacyService.addInventoryItem(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<PharmacyInventory> updateInventoryItem(
            @PathVariable("id") Long id,
            @Valid @RequestBody PharmacyInventoryRequest request) {
        PharmacyInventory response = pharmacyService.updateInventoryItem(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<Void> deleteInventoryItem(@PathVariable("id") Long id) {
        pharmacyService.deleteInventoryItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<PharmacyInventory>> getLowStock(@RequestParam("hospitalId") Long hospitalId) {
        return ResponseEntity.ok(pharmacyService.getLowStockItems(hospitalId));
    }

    @PostMapping("/dispense")
    public ResponseEntity<Void> dispenseMedicines(
            @RequestParam("recordId") Long recordId,
            @RequestParam("medicineId") Long medicineId,
            @RequestParam("quantity") int quantity) {
        pharmacyService.dispenseMedicines(recordId, medicineId, quantity);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<PharmacyInventory>> getExpiringItems(@RequestParam("hospitalId") Long hospitalId) {
        return ResponseEntity.ok(pharmacyService.getExpiringItems(hospitalId));
    }
}
